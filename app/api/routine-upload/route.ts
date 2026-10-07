import { NextResponse } from "next/server";
import { requireUser } from "@/lib/data";
import { isAdminUser } from "@/lib/auth/admin";
import { extractTextFromPDF, parseRoutineText } from "@/lib/routine/parser";
import { saveDraftRoutine } from "@/lib/routine/store";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();

  // Strict server-side admin check
  if (!isAdminUser(user)) {
    return NextResponse.json(
      { error: "Forbidden: Only the university routine administrator (mdsorojmolla20@gmail.com) can upload routine schedules." },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const versionName =
    formData.get("versionName")?.toString().trim() ||
    `Routine ${new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a valid PDF file." }, { status: 400 });
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json(
      { error: "University routine upload must be a PDF document." },
      { status: 400 }
    );
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Routine uploads must be 20 MB or smaller." },
      { status: 400 }
    );
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extractedText = await extractTextFromPDF(buffer);

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF. Please ensure it contains selectable text." },
        { status: 400 }
      );
    }

    const parsed = parseRoutineText(extractedText);

    // Save PDF to storage
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `versions/${crypto.randomUUID()}-${safeName}`;
    await supabase.storage.from("routine-uploads").upload(path, buffer, {
      contentType: "application/pdf",
      upsert: true
    });

    const { versionId } = await saveDraftRoutine(supabase, user, {
      versionName,
      fileName: file.name,
      sourceFile: path,
      batches: parsed.batches,
      classes: parsed.classes
    });

    return NextResponse.json({
      status: "DRAFT",
      versionId,
      batches: parsed.batches,
      classesCount: parsed.classes.length,
      message: `Routine parsed successfully! Discovered ${parsed.batches.length} batches and ${parsed.classes.length} classes. Ready for review.`
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
