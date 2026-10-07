import { z } from "zod";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a valid time.");

export const prioritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export const taskStatusSchema = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "SKIPPED",
  "CANCELLED"
]);

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Task title is required.").max(120),
    description: z.string().trim().max(600).optional().nullable(),
    date: z.string().date().optional().nullable(),
    weekStart: z.string().date().optional().nullable(),
    scope: z.enum(["DAILY", "WEEKLY"]).default("DAILY"),
    startTime: timeSchema.optional().nullable(),
    endTime: timeSchema.optional().nullable(),
    priority: prioritySchema.default("MEDIUM"),
    category: z.string().trim().max(80).optional().nullable(),
    reminderEnabled: z.boolean().default(true)
  })
  .superRefine((value, ctx) => {
    if (value.scope === "DAILY" && !value.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Daily tasks need a date."
      });
    }
    if (value.scope === "WEEKLY" && !value.weekStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["weekStart"],
        message: "Weekly tasks need a week."
      });
    }
    if (value.startTime && value.endTime && value.endTime <= value.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be after start time."
      });
    }
  });

export const rescheduleTaskSchema = z.object({
  id: z.string().uuid(),
  date: z.string().date(),
  startTime: timeSchema.optional().nullable(),
  endTime: timeSchema.optional().nullable()
});

export const createClassSchema = z
  .object({
    courseName: z.string().trim().min(1, "Course name is required.").max(140),
    teacher: z.string().trim().max(120).optional().nullable(),
    room: z.string().trim().max(80).optional().nullable(),
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: timeSchema,
    endTime: timeSchema,
    reminderEnabled: z.boolean().default(true)
  })
  .refine((value) => value.endTime > value.startTime, {
    path: ["endTime"],
    message: "End time must be after start time."
  });

export const createActivitySchema = z.object({
  name: z.string().trim().min(1, "Activity name is required.").max(100),
  category: z.string().trim().min(1).max(80).default("Personal"),
  startTime: timeSchema,
  durationMinutes: z.coerce.number().int().min(5).max(480),
  repeatRule: z.enum(["DAILY", "WEEKDAYS", "WEEKENDS"]).default("DAILY"),
  enabled: z.boolean().default(true),
  trackingEnabled: z.boolean().default(true),
  reminderEnabled: z.boolean().default(true)
});

export const createHolidaySchema = z.object({
  name: z.string().trim().min(1, "Holiday name is required.").max(120),
  date: z.string().date(),
  description: z.string().trim().max(400).optional().nullable(),
  repeatRule: z.enum(["NONE", "YEARLY"]).default("NONE"),
  affectsClasses: z.boolean().default(true)
});

export const updateSettingsSchema = z.object({
  browserNotificationsEnabled: z.boolean().default(false),
  reminderBeforeMinutes: z.coerce.number().int().min(0).max(120),
  quietHoursStart: timeSchema.optional().nullable(),
  quietHoursEnd: timeSchema.optional().nullable()
});

export function formString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function formBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}
