import type { RoutineBatch, RoutineClass, RoutineVersion, UUID } from "@/lib/domain";
import { assertAdmin } from "@/lib/auth/admin";
import { getOrCreateActiveRoutine } from "@/lib/data";

type SupabaseClient = any;

/**
 * Gets the currently published university routine version
 */
export async function getPublishedRoutine(supabase: SupabaseClient): Promise<{
  version: RoutineVersion | null;
  batches: string[];
}> {
  try {
    // 1. Try relational routine_versions table
    const { data: version, error } = await supabase
      .from("routine_versions")
      .select("*")
      .eq("status", "PUBLISHED")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && version) {
      const { data: batchesData } = await supabase
        .from("routine_batches")
        .select("batch_code")
        .eq("routine_version_id", version.id)
        .order("batch_code");

      const batches = (batchesData ?? []).map((b: any) => b.batch_code);
      return {
        version: mapRoutineVersion(version),
        batches
      };
    }
  } catch {
    // Fallback if table not yet created
  }

  // 2. Fallback to routine_uploads with status = 'PUBLISHED'
  try {
    const { data: upload } = await supabase
      .from("routine_uploads")
      .select("*")
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (upload && upload.extracted_payload) {
      const payload = upload.extracted_payload;
      return {
        version: {
          id: upload.id,
          versionName: payload.versionName || "Published University Routine",
          sourceFile: upload.file_path,
          fileName: payload.fileName || "Routine.pdf",
          status: "PUBLISHED",
          uploadedBy: upload.user_id,
          publishedAt: upload.updated_at || upload.created_at,
          createdAt: upload.created_at,
          batchesCount: payload.batches?.length ?? 0,
          classesCount: payload.classes?.length ?? 0
        },
        batches: payload.batches || []
      };
    }
  } catch {
    // Fallback safe
  }

  return { version: null, batches: [] };
}

/**
 * Gets all classes for a specific batch from the published routine
 */
export async function getPublishedClassesForBatch(
  supabase: SupabaseClient,
  batchCode: string
): Promise<RoutineClass[]> {
  const { version } = await getPublishedRoutine(supabase);
  if (!version) return [];

  try {
    // 1. Try relational routine_classes table
    const { data, error } = await supabase
      .from("routine_classes")
      .select("*")
      .eq("routine_version_id", version.id)
      .eq("batch_code", batchCode)
      .order("day_of_week")
      .order("start_time");

    if (!error && data && data.length > 0) {
      return data.map(mapRoutineClass);
    }
  } catch {
    // Fallback to jsonb in routine_uploads
  }

  // 2. Fallback to routine_uploads jsonb
  try {
    const { data: upload } = await supabase
      .from("routine_uploads")
      .select("extracted_payload")
      .eq("id", version.id)
      .maybeSingle();

    if (upload?.extracted_payload?.classes) {
      const all: any[] = upload.extracted_payload.classes;
      return all
        .filter((c) => c.batchCode === batchCode)
        .map((c, idx) => ({
          id: `rc-${idx}`,
          routineVersionId: version.id,
          batchCode: c.batchCode,
          labGroup: c.labGroup ?? null,
          dayOfWeek: c.dayOfWeek,
          startTime: c.startTime,
          endTime: c.endTime,
          courseCode: c.courseCode,
          teacher: c.teacher ?? null,
          room: c.room ?? null,
          classType: c.classType || "Theory",
          roomType: c.roomType ?? null
        }));
    }
  } catch {
    // Fallback safe
  }

  return [];
}

/**
 * Synchronizes a user's weekly routine classes when they pick or change their batch
 */
export async function syncUserWeeklyRoutine(
  supabase: SupabaseClient,
  userId: string,
  batchCode: string
): Promise<{ success: boolean; classesCreated: number }> {
  const routineClasses = await getPublishedClassesForBatch(supabase, batchCode);
  const userRoutine = await getOrCreateActiveRoutine(supabase, userId);

  // 1. Remove previous university classes for this user to avoid duplicate or mixed batches
  try {
    await supabase
      .from("classes")
      .delete()
      .eq("user_id", userId)
      .eq("is_university", true);
  } catch {
    // If is_university column doesn't exist yet, delete classes belonging to the active routine
    await supabase
      .from("classes")
      .delete()
      .eq("user_id", userId)
      .eq("routine_id", userRoutine.id);
  }

  // 2. Insert new weekly recurring classes for the selected batch
  let classesCreated = 0;
  if (routineClasses.length > 0) {
    const recordsToInsert = routineClasses.map((rc) => {
      const title = rc.labGroup ? `${rc.courseCode} (${rc.labGroup})` : rc.courseCode;
      const subtitle = [rc.room, rc.teacher, rc.classType].filter(Boolean).join(" · ");

      return {
        user_id: userId,
        routine_id: userRoutine.id,
        course_name: title,
        teacher: rc.teacher,
        room: rc.room,
        day_of_week: rc.dayOfWeek,
        start_time: rc.startTime,
        end_time: rc.endTime,
        enabled: true,
        reminder_enabled: true
      };
    });

    const { error: insertError } = await supabase.from("classes").insert(recordsToInsert);
    if (!insertError) {
      classesCreated = recordsToInsert.length;
    }
  }

  // 3. Save selected_batch in user metadata and settings
  try {
    await supabase.auth.updateUser({
      data: { selected_batch: batchCode }
    });
  } catch {
    // Best-effort auth metadata
  }

  try {
    await supabase
      .from("settings")
      .update({ selected_batch: batchCode, setup_completed: true })
      .eq("user_id", userId);
  } catch {
    // In case column is missing
  }

  try {
    await supabase
      .from("profiles")
      .update({ selected_batch: batchCode })
      .eq("id", userId);
  } catch {
    // In case column is missing
  }

  return { success: true, classesCreated };
}

/**
 * Saves a new draft routine version (Admin only)
 */
export async function saveDraftRoutine(
  supabase: SupabaseClient,
  currentUser: { email?: string | null; id: string },
  data: {
    versionName: string;
    fileName?: string;
    sourceFile?: string;
    batches: string[];
    classes: Omit<RoutineClass, "id" | "routineVersionId">[];
  }
): Promise<{ versionId: string }> {
  assertAdmin(currentUser);

  // 1. Try relational insertion
  try {
    const { data: created, error } = await supabase
      .from("routine_versions")
      .insert({
        version_name: data.versionName,
        file_name: data.fileName ?? null,
        source_file: data.sourceFile ?? null,
        status: "DRAFT",
        uploaded_by: currentUser.id
      })
      .select("id")
      .single();

    if (!error && created) {
      const versionId = created.id;

      // Insert batches
      if (data.batches.length > 0) {
        const batchRecords = data.batches.map((code) => ({
          routine_version_id: versionId,
          batch_code: code
        }));
        await supabase.from("routine_batches").insert(batchRecords);
      }

      // Insert classes
      if (data.classes.length > 0) {
        const classRecords = data.classes.map((c) => ({
          routine_version_id: versionId,
          batch_code: c.batchCode,
          lab_group: c.labGroup ?? null,
          day_of_week: c.dayOfWeek,
          start_time: c.startTime,
          end_time: c.endTime,
          course_code: c.courseCode,
          teacher: c.teacher ?? null,
          room: c.room ?? null,
          class_type: c.classType || "Theory",
          room_type: c.roomType ?? null
        }));
        await supabase.from("routine_classes").insert(classRecords);
      }

      return { versionId };
    }
  } catch {
    // Fallback to routine_uploads
  }

  // 2. Fallback to routine_uploads
  const { data: fallbackCreated, error: fallbackError } = await supabase
    .from("routine_uploads")
    .insert({
      user_id: currentUser.id,
      file_path: data.sourceFile || "routine.pdf",
      file_type: "application/pdf",
      status: "DRAFT",
      extracted_payload: {
        versionName: data.versionName,
        fileName: data.fileName,
        batches: data.batches,
        classes: data.classes
      }
    })
    .select("id")
    .single();

  if (fallbackError) throw new Error(fallbackError.message);
  return { versionId: fallbackCreated.id };
}

/**
 * Publishes a routine version so all users receive it (Admin only)
 */
export async function publishRoutineVersion(
  supabase: SupabaseClient,
  currentUser: { email?: string | null },
  versionId: string
): Promise<void> {
  assertAdmin(currentUser);

  // 1. Try relational update
  try {
    // Archive previous published versions
    await supabase
      .from("routine_versions")
      .update({ status: "ARCHIVED" })
      .eq("status", "PUBLISHED");

    // Publish target version
    const { error } = await supabase
      .from("routine_versions")
      .update({
        status: "PUBLISHED",
        published_at: new Date().toISOString()
      })
      .eq("id", versionId);

    if (!error) return;
  } catch {
    // Fallback
  }

  // 2. Fallback to routine_uploads
  await supabase
    .from("routine_uploads")
    .update({ status: "ARCHIVED" })
    .eq("status", "PUBLISHED");

  await supabase
    .from("routine_uploads")
    .update({
      status: "PUBLISHED",
      updated_at: new Date().toISOString()
    })
    .eq("id", versionId);
}

/**
 * Lists all routine versions for admin review
 */
export async function getAllRoutineVersions(supabase: SupabaseClient): Promise<RoutineVersion[]> {
  try {
    const { data, error } = await supabase
      .from("routine_versions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map(mapRoutineVersion);
    }
  } catch {
    // Fallback
  }

  try {
    const { data } = await supabase
      .from("routine_uploads")
      .select("*")
      .order("created_at", { ascending: false });

    return (data ?? []).map((u: any) => ({
      id: u.id,
      versionName: u.extracted_payload?.versionName || "Routine Upload",
      sourceFile: u.file_path,
      fileName: u.extracted_payload?.fileName || "Routine.pdf",
      status: u.status,
      uploadedBy: u.user_id,
      publishedAt: u.status === "PUBLISHED" ? u.updated_at || u.created_at : null,
      createdAt: u.created_at,
      batchesCount: u.extracted_payload?.batches?.length ?? 0,
      classesCount: u.extracted_payload?.classes?.length ?? 0
    }));
  } catch {
    return [];
  }
}

function mapRoutineVersion(row: any): RoutineVersion {
  return {
    id: row.id,
    versionName: row.version_name,
    sourceFile: row.source_file,
    fileName: row.file_name,
    status: row.status,
    uploadedBy: row.uploaded_by,
    publishedAt: row.published_at,
    createdAt: row.created_at
  };
}

function mapRoutineClass(row: any): RoutineClass {
  return {
    id: row.id,
    routineVersionId: row.routine_version_id,
    batchCode: row.batch_code,
    labGroup: row.lab_group,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time?.slice(0, 5) || "08:30",
    endTime: row.end_time?.slice(0, 5) || "10:00",
    courseCode: row.course_code,
    teacher: row.teacher,
    room: row.room,
    classType: row.class_type || "Theory",
    roomType: row.room_type
  };
}
