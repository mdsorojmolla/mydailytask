"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type UploadState = {
  status: "idle" | "uploading" | "done" | "error";
  message: string;
};

export function RoutineUploadForm() {
  const [state, setState] = useState<UploadState>({
    status: "idle",
    message: ""
  });

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        setState({ status: "uploading", message: "Uploading routine..." });
        const response = await fetch("/api/routine-upload", {
          method: "POST",
          body: formData
        });
        const payload = await response.json();
        if (!response.ok) {
          setState({
            status: "error",
            message: payload.error ?? "Routine upload failed."
          });
          return;
        }
        form.reset();
        setState({
          status: "done",
          message: payload.message ?? "Routine uploaded for review."
        });
      }}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Upload routine</span>
        <input
          name="file"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          required
          className="focus-ring block w-full rounded-md border border-line bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-accentSoft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent"
        />
      </label>
      <Button type="submit" tone="secondary">
        <Upload aria-hidden="true" size={16} />
        Upload
      </Button>
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`text-sm ${state.status === "error" ? "text-danger" : "text-muted"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
