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
import {
  errorMessage,
  redirectWithMessage,
  returnTo,
  rethrowIfRedirect
} from "@/app/actions/helpers";

/**
 * User action: Selects or changes their academic batch (e.g. 71_B)
 */
export async function selectUserBatchAction(formData: FormData) {
  const path = returnTo(formData, "/routine");
  const batchCode = formData.get("batchCode")?.toString().trim();

  if (!batchCode) {
    redirectWithMessage(path, "error", "Please select a valid CSE Batch.");
  }

  let classesCreated = 0;
  try {
    const { supabase, user } = await requireUser();
    const result = await syncUserWeeklyRoutine(supabase, user.id, batchCode);
    classesCreated = result.classesCreated;

    revalidatePath("/home");
    revalidatePath("/routine");
    revalidatePath("/calendar");
    revalidatePath("/settings");
  } catch (error) {
    rethrowIfRedirect(error);
    redirectWithMessage(path, "error", errorMessage(error));
  }

  redirectWithMessage(
    path,
    "success",
    `Batch ${batchCode} selected! Loaded ${classesCreated} weekly classes into your routine.`
  );
}

/**
 * Admin action: Uploads a university routine PDF, parses batches, and creates a draft
 */
export async function uploadAndParseRoutineAction(formData: FormData) {
  const path = returnTo(formData, "/routine");
  let versionId = "";
  let batchesCount = 0;
  let classesCount = 0;

  try {
    const { supabase, user } = await requireUser();
    assertAdmin(user);

    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new Error("Please select a valid PDF file.");
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("The routine file must be a PDF document.");
    }

    if (file.size > 20 * 1024 * 1024) {
      throw new Error("PDF size must be 20 MB or smaller.");
    }

    // Read buffer and extract text
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extractedText = await extractTextFromPDF(buffer);
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("Could not extract text from this PDF. Please ensure it contains selectable text, not scanned images.");
    }

    const parsed = parseRoutineText(extractedText);

    if (parsed.batches.length === 0) {
      throw new Error("No academic batches (e.g. 71_B, 71_A) detected in the uploaded PDF.");
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
    const saved = await saveDraftRoutine(supabase, user, {
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

    versionId = saved.versionId;
    batchesCount = parsed.batches.length;
    classesCount = parsed.classes.length;

    revalidatePath("/routine");
  } catch (error) {
    rethrowIfRedirect(error);
    redirectWithMessage(path, "error", errorMessage(error));
  }

  redirectWithMessage(
    `/routine?reviewVersionId=${versionId}`,
    "success",
    `Routine parsed successfully! Discovered ${batchesCount} batches and ${classesCount} classes. Review before publishing.`
  );
}

/**
 * Admin action: Publishes a reviewed routine version
 */
export async function publishRoutineAction(formData: FormData) {
  const path = returnTo(formData, "/routine");
  const versionId = formData.get("versionId")?.toString().trim();

  if (!versionId) {
    redirectWithMessage(path, "error", "Missing routine version ID.");
  }

  try {
    const { supabase, user } = await requireUser();
    assertAdmin(user);

    await publishRoutineVersion(supabase, user, versionId);

    revalidatePath("/home");
    revalidatePath("/routine");
    revalidatePath("/calendar");
  } catch (error) {
    rethrowIfRedirect(error);
    redirectWithMessage(path, "error", errorMessage(error));
  }

  redirectWithMessage(
    "/routine",
    "success",
    "University routine successfully published! All students will now view the updated schedule."
  );
}

/**
 * Directly applies and activates Section 71_B routine for the user
 */
export async function applySection71BRoutineAction(formData: FormData) {
  const path = returnTo(formData, "/routine");
  let classesCreated = 0;
  try {
    const { supabase, user } = await requireUser();
    const result = await syncUserWeeklyRoutine(supabase, user.id, "71_B");
    classesCreated = result.classesCreated;

    revalidatePath("/home");
    revalidatePath("/routine");
    revalidatePath("/calendar");
    revalidatePath("/settings");
  } catch (error) {
    rethrowIfRedirect(error);
    redirectWithMessage(path, "error", errorMessage(error));
  }

  redirectWithMessage(
    path,
    "success",
    `Section 71_B routine active with ${classesCreated} classes!`
  );
}
