import { describe, expect, it } from "vitest";
import type { ScheduleSource } from "@/lib/domain";
import { buildDailySchedule } from "@/lib/schedule/engine";
import { getReminderCandidates } from "@/lib/schedule/reminders";

const baseSource: ScheduleSource = {
  settings: {
    userId: "user-1",
    setupCompleted: true,
    browserNotificationsEnabled: true,
    reminderBeforeMinutes: 15,
    quietHoursStart: null,
    quietHoursEnd: null,
    selectedBatch: null
  },
  classes: [
    {
      id: "class-1",
      userId: "user-1",
      routineId: "routine-1",
      courseName: "Database Systems",
      teacher: "Dr. Rahman",
      room: "402",
      dayOfWeek: 3,
      startTime: "10:30",
      endTime: "12:00",
      enabled: true,
      reminderEnabled: true
    }
  ],
  classExceptions: [],
  activities: [
    {
      id: "activity-1",
      userId: "user-1",
      name: "Breakfast",
      category: "Meal",
      startTime: "08:00",
      durationMinutes: 30,
      repeatRule: "DAILY",
      enabled: true,
      trackingEnabled: true,
      reminderEnabled: true
    },
    {
      id: "activity-disabled",
      userId: "user-1",
      name: "Shower",
      category: "Personal",
      startTime: "08:45",
      durationMinutes: 15,
      repeatRule: "DAILY",
      enabled: false,
      trackingEnabled: true,
      reminderEnabled: true
    }
  ],
  activityHistory: [],
  tasks: [
    {
      id: "task-1",
      userId: "user-1",
      title: "Complete C Assignment",
      description: null,
      scope: "DAILY",
      date: "2026-10-07",
      weekStart: null,
      startTime: "14:00",
      endTime: "15:00",
      priority: "HIGH",
      status: "NOT_STARTED",
      category: "Study",
      reminderEnabled: true,
      startedAt: null,
      completedAt: null,
      createdAt: "2026-10-07T00:00:00.000Z",
      updatedAt: "2026-10-07T00:00:00.000Z"
    },
    {
      id: "task-complete",
      userId: "user-1",
      title: "Read Chapter 4",
      description: null,
      scope: "DAILY",
      date: "2026-10-07",
      weekStart: null,
      startTime: "16:00",
      endTime: "17:00",
      priority: "MEDIUM",
      status: "COMPLETED",
      category: "Study",
      reminderEnabled: true,
      startedAt: null,
      completedAt: "2026-10-07T10:00:00.000Z",
      createdAt: "2026-10-07T00:00:00.000Z",
      updatedAt: "2026-10-07T00:00:00.000Z"
    }
  ],
  holidays: []
};

describe("schedule engine", () => {
  it("excludes disabled activities from the timeline", () => {
    const schedule = buildDailySchedule({
      date: "2026-10-07",
      source: baseSource,
      now: new Date("2026-10-07T07:30:00")
    });

    expect(schedule.items.map((item) => item.title)).toContain("Breakfast");
    expect(schedule.items.map((item) => item.title)).not.toContain("Shower");
  });

  it("removes cancelled classes from active reminders", () => {
    const schedule = buildDailySchedule({
      date: "2026-10-07",
      source: {
        ...baseSource,
        classExceptions: [
          {
            id: "exception-1",
            userId: "user-1",
            classId: "class-1",
            date: "2026-10-07",
            status: "CANCELLED",
            note: null
          }
        ]
      },
      now: new Date("2026-10-07T09:00:00")
    });

    const reminders = getReminderCandidates(schedule, 15);
    expect(schedule.items.find((item) => item.type === "CLASS")?.status).toBe(
      "CANCELLED"
    );
    expect(reminders.some((reminder) => reminder.item.type === "CLASS")).toBe(false);
  });

  it("does not create reminders for completed tasks", () => {
    const schedule = buildDailySchedule({
      date: "2026-10-07",
      source: baseSource,
      now: new Date("2026-10-07T12:00:00")
    });

    const reminders = getReminderCandidates(schedule, 15);
    expect(reminders.map((reminder) => reminder.item.sourceId)).not.toContain(
      "task-complete"
    );
  });

  it("lets holidays affect classes without deleting personal tasks", () => {
    const schedule = buildDailySchedule({
      date: "2026-10-07",
      source: {
        ...baseSource,
        holidays: [
          {
            id: "holiday-1",
            userId: "user-1",
            name: "University Holiday",
            date: "2026-10-07",
            description: null,
            repeatRule: "NONE",
            affectsClasses: true
          }
        ]
      },
      now: new Date("2026-10-07T09:00:00")
    });

    expect(schedule.items.some((item) => item.type === "CLASS")).toBe(false);
    expect(schedule.items.some((item) => item.sourceId === "task-1")).toBe(true);
  });

  it("prioritizes the current item over later work", () => {
    const schedule = buildDailySchedule({
      date: "2026-10-07",
      source: baseSource,
      now: new Date("2026-10-07T10:45:00")
    });

    expect(schedule.now?.title).toBe("Database Systems");
    expect(schedule.next?.title).toBe("Complete C Assignment");
  });
});
