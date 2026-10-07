"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/data";
import { assertAdmin } from "@/lib/auth/admin";
import { extractTextFromPDF, parseRoutineText } from "@/lib/routine/parser";
import {
  publishRoutineVersion,
  saveDraftRoutine,
  syncUserWeeklyRoutine
} from "@/lib/routine/store";
import { redirectWithMessage, returnTo } from "@/app/actions/helpers";

/**
 * User action: Selects or changes their academic batch (e.g. 71_B)
 */
export async function selectUserBatchAction(formData: FormData) {
  const path = returnTo(formData, "/routine");
  const batchCode = formData.get("batchCode")?.toString().trim();

  if (!batchCode) {
    redirectWithMessage(path, "error", "Please select a valid CSE Batch.");
  }

  try {
    const { supabase, user } = await requireUser();
    const result = await syncUserWeeklyRoutine(supabase, user.id, batchCode);

    revalidatePath("/home");
    revalidatePath("/routine");
    revalidatePath("/calendar");
    revalidatePath("/settings");

    redirectWithMessage(
      path,
      "success",
      `Batch ${batchCode} selected! Loaded ${result.classesCreated} weekly classes into your routine.`
    );
  } catch (error) {
    redirectWithMessage(path, "error", (error as Error).message);
  }
}

/**
 * Admin action: Uploads a university routine PDF, parses batches, and creates a draft
 */
export async function uploadAndParseRoutineAction(formData: FormData) {
  const path = returnTo(formData, "/routine");

  try {
    const { supabase, user } = await requireUser();
    assertAdmin(user);

    const file = formData.get("file");

    if (!(file instanceof File)) {
      redirectWithMessage(path, "error", "Please select a valid PDF file.");
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      redirectWithMessage(path, "error", "The routine file must be a PDF document.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      redirectWithMessage(path, "error", "PDF size must be 20 MB or smaller.");
      return;
    }

    // Read buffer and extract text
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extractedText = await extractTextFromPDF(buffer);
    if (!extractedText || extractedText.trim().length === 0) {
      redirectWithMessage(path, "error", "Could not extract text from this PDF. Please ensure it contains selectable text, not scanned images.");
      return;
    }

    const parsed = parseRoutineText(extractedText);

    if (parsed.batches.length === 0) {
      redirectWithMessage(path, "error", "No academic batches (e.g. 71_B, 71_A) detected in the uploaded PDF.");
      return;
    }

    // Upload source file to storage
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `versions/${crypto.randomUUID()}-${safeName}`;

    await supabase.storage.from("routine-uploads").upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: true
    });

    const rawVersionName = formData.get("versionName")?.toString().trim();
    const versionName = rawVersionName && rawVersionName !== "Routine V4.1"
      ? rawVersionName
      : (parsed.versionName || "Routine V4.1");

    // Save as draft
    const { versionId } = await saveDraftRoutine(supabase, user, {
      versionName,
      fileName: file.name,
      sourceFile: storagePath,
      batches: parsed.batches,
      classes: parsed.classes,
      meta: {
        effectiveFrom: parsed.effectiveFrom,
        versionName: parsed.versionName,
        totalClasses: parsed.stats.totalClasses,
        daysWithClasses: parsed.stats.daysWithClasses
      }
    });

    revalidatePath("/routine");
    redirectWithMessage(
      `/routine?reviewVersionId=${versionId}`,
      "success",
      `Routine parsed successfully! Discovered ${parsed.batches.length} batches and ${parsed.classes.length} classes. Review before publishing.`
    );
  } catch (error) {
    redirectWithMessage(path, "error", (error as Error).message);
  }
}

/**
 * Admin action: Publishes a reviewed routine version
 */
export async function publishRoutineAction(formData: FormData) {
  const path = returnTo(formData, "/routine");
  const versionId = formData.get("versionId")?.toString().trim();

  if (!versionId) {
    redirectWithMessage(path, "error", "Missing routine version ID.");
    return;
  }

  try {
    const { supabase, user } = await requireUser();
    assertAdmin(user);

    await publishRoutineVersion(supabase, user, versionId);

    revalidatePath("/home");
    revalidatePath("/routine");
    revalidatePath("/calendar");

    redirectWithMessage(
      "/routine",
      "success",
      "University routine successfully published! All students will now view the updated schedule."
    );
  } catch (error) {
    redirectWithMessage(path, "error", (error as Error).message);
  }
}
