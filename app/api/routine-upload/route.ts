import { NextResponse } from "next/server";
import { requireUser } from "@/lib/data";

const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a PDF or image." }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Routine uploads must be PDF, JPEG, PNG, or WebP." },
      { status: 400 }
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Routine uploads must be 10 MB or smaller." },
      { status: 400 }
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("routine-uploads")
    .upload(path, file, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("routine_uploads").insert({
    user_id: user.id,
    file_path: path,
    file_type: file.type,
    status: "REVIEW_REQUIRED",
    extracted_payload: {
      detectedClasses: [],
      uncertainFields: [],
      note: "File stored for review. Automatic extraction is intentionally not saved without confirmation."
    }
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    status: "REVIEW_REQUIRED",
    detectedClasses: [],
    uncertainFields: [],
    message:
      "Routine file uploaded. Review it and add classes manually before saving."
  });
}
