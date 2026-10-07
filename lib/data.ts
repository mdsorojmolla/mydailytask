import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type {
  Activity,
  ActivityHistory,
  AppSettings,
  ClassException,
  Holiday,
  Routine,
  ScheduleSource,
  Task,
  UniversityClass
} from "@/lib/domain";
import { buildDailySchedule } from "@/lib/schedule/engine";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseISODate, weekStartISO } from "@/lib/utils/dates";

export const requireUser = cache(async () => {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/login?error=missing-env");

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const settings = await ensureSettingsAndProfile(supabase, user);

  return { supabase, user, settings };
});

export async function getHomeData(date: string) {
  const { supabase, user, settings } = await requireUser();
  const source = await getScheduleSource(supabase, user.id, settings, date);
  return {
    user,
    settings,
    schedule: buildDailySchedule({ date, source })
  };
}

export async function getScheduleForDate(date: string) {
  const { supabase, user, settings } = await requireUser();
  const source = await getScheduleSource(supabase, user.id, settings, date);
  return buildDailySchedule({ date, source });
}

export async function getTasksPageData() {
  const { supabase, user } = await requireUser();
  const today = new Date();
  const weekStart = weekStartISO(today);
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .or(`date.gte.${weekStart},week_start.eq.${weekStart}`)
    .order("date", { ascending: true, nullsFirst: false })
    .order("start_time", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);

  const tasks = (data ?? []).map(mapTask);
  return {
    tasks,
    daily: tasks.filter((task) => task.scope === "DAILY"),
    weekly: tasks.filter((task) => task.scope === "WEEKLY")
  };
}

export async function getRoutinePageData() {
  const { supabase, user } = await requireUser();
  const [routine, classesResult, holidaysResult] = await Promise.all([
    getOrCreateActiveRoutine(supabase, user.id),
    supabase
      .from("classes")
      .select("*")
      .eq("user_id", user.id)
      .order("day_of_week")
      .order("start_time"),
    supabase
      .from("holidays")
      .select("*")
      .eq("user_id", user.id)
      .order("date")
  ]);

  if (classesResult.error) throw new Error(classesResult.error.message);
  if (holidaysResult.error) throw new Error(holidaysResult.error.message);

  const classes = (classesResult.data ?? [])
    .filter((c: any) => c.routine_id === routine.id)
    .map(mapClass);

  return {
    routine,
    classes,
    holidays: (holidaysResult.data ?? []).map(mapHoliday)
  };
}

export async function getSettingsPageData() {
  const { supabase, user, settings } = await requireUser();
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", user.id)
    .order("start_time");

  if (error) throw new Error(error.message);

  return {
    user,
    settings,
    activities: (data ?? []).map(mapActivity)
  };
}

export async function getInsightsData() {
  const { supabase, user } = await requireUser();
  const start = weekStartISO(new Date());
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .or(`date.gte.${start},week_start.eq.${start}`);

  if (error) throw new Error(error.message);

  const tasks = (data ?? []).map(mapTask);
  const completed = tasks.filter((task) => task.status === "COMPLETED");
  const high = tasks.filter((task) => task.priority === "HIGH");
  const completedHigh = high.filter((task) => task.status === "COMPLETED");

  return {
    tasks,
    completed,
    high,
    completedHigh,
    completionRate:
      tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100),
    highCompletionRate:
      high.length === 0
        ? 0
        : Math.round((completedHigh.length / high.length) * 100)
  };
}

export async function getSetupData() {
  const { user, settings } = await requireUser();
  return { user, settings };
}

async function getScheduleSource(
  supabase: ServerSupabaseClient,
  userId: string,
  settings: AppSettings,
  date: string
): Promise<ScheduleSource> {
  const weekStart = weekStartISO(parseISODate(date));

  // Run routine check and all 6 schedule data queries in parallel
  const [
    routine,
    classesResult,
    exceptionsResult,
    activitiesResult,
    activityHistoryResult,
    tasksResult,
    holidaysResult
  ] = await Promise.all([
    getOrCreateActiveRoutine(supabase, userId),
    supabase
      .from("classes")
      .select("*")
      .eq("user_id", userId),
    supabase
      .from("class_exceptions")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date),
    supabase.from("activities").select("*").eq("user_id", userId),
    supabase
      .from("activity_history")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date),
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .or(`date.eq.${date},week_start.eq.${weekStart}`),
    supabase.from("holidays").select("*").eq("user_id", userId)
  ]);

  for (const result of [
    classesResult,
    exceptionsResult,
    activitiesResult,
    activityHistoryResult,
    tasksResult,
    holidaysResult
  ]) {
    if (result.error) throw new Error(result.error.message);
  }

  // Filter classes for the active routine in memory
  const activeClasses = (classesResult.data ?? [])
    .filter((c: any) => c.routine_id === routine.id)
    .map(mapClass);

  return {
    settings,
    classes: activeClasses,
    classExceptions: (exceptionsResult.data ?? []).map(mapClassException),
    activities: (activitiesResult.data ?? []).map(mapActivity),
    activityHistory: (activityHistoryResult.data ?? []).map(mapActivityHistory),
    tasks: (tasksResult.data ?? []).map(mapTask),
    holidays: (holidaysResult.data ?? []).map(mapHoliday)
  };
}

async function ensureProfile(
  supabase: ServerSupabaseClient,
  user: User
) {
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : user.email ?? null;
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl
    },
    { onConflict: "id" }
  );

  if (error) throw new Error(error.message);
}

async function ensureSettingsAndProfile(
  supabase: ServerSupabaseClient,
  user: User
): Promise<AppSettings> {
  // Fast path: settings already exist (99.9% of user requests)
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data) return mapSettings(data);

  // Slow path: first-time setup only. Ensure profile exists before inserting settings
  await ensureProfile(supabase, user);

  const { data: created, error: insertError } = await supabase
    .from("settings")
    .insert({ user_id: user.id })
    .select("*")
    .single();

  if (insertError) throw new Error(insertError.message);
  return mapSettings(created);
}

export const getOrCreateActiveRoutine = cache(
  async (
    supabase: ServerSupabaseClient,
    userId: string
  ): Promise<Routine> => {
    const { data, error } = await supabase
      .from("routines")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data) return mapRoutine(data);

    const { data: created, error: insertError } = await supabase
      .from("routines")
      .insert({ user_id: userId, name: "Current Routine", term: null, active: true })
      .select("*")
      .single();

    if (insertError) throw new Error(insertError.message);
    return mapRoutine(created);
  }
);

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

function mapSettings(row: any): AppSettings {
  return {
    userId: row.user_id,
    setupCompleted: row.setup_completed,
    browserNotificationsEnabled: row.browser_notifications_enabled,
    reminderBeforeMinutes: row.reminder_before_minutes,
    quietHoursStart: row.quiet_hours_start?.slice(0, 5) ?? null,
    quietHoursEnd: row.quiet_hours_end?.slice(0, 5) ?? null
  };
}

function mapRoutine(row: any): Routine {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    term: row.term,
    active: row.active
  };
}

function mapClass(row: any): UniversityClass {
  return {
    id: row.id,
    userId: row.user_id,
    routineId: row.routine_id,
    courseName: row.course_name,
    teacher: row.teacher,
    room: row.room,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time?.slice(0, 5),
    endTime: row.end_time?.slice(0, 5),
    enabled: row.enabled,
    reminderEnabled: row.reminder_enabled
  };
}

function mapClassException(row: any): ClassException {
  return {
    id: row.id,
    userId: row.user_id,
    classId: row.class_id,
    date: row.date,
    status: row.status,
    note: row.note
  };
}

function mapActivity(row: any): Activity {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category,
    startTime: row.start_time?.slice(0, 5),
    durationMinutes: row.duration_minutes,
    repeatRule: row.repeat_rule,
    enabled: row.enabled,
    trackingEnabled: row.tracking_enabled,
    reminderEnabled: row.reminder_enabled
  };
}

function mapActivityHistory(row: any): ActivityHistory {
  return {
    id: row.id,
    userId: row.user_id,
    activityId: row.activity_id,
    date: row.date,
    status: row.status,
    completedAt: row.completed_at
  };
}

function mapTask(row: any): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    scope: row.scope,
    date: row.date,
    weekStart: row.week_start,
    startTime: row.start_time?.slice(0, 5) ?? null,
    endTime: row.end_time?.slice(0, 5) ?? null,
    priority: row.priority,
    status: row.status,
    category: row.category,
    reminderEnabled: row.reminder_enabled,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapHoliday(row: any): Holiday {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    date: row.date,
    description: row.description,
    repeatRule: row.repeat_rule,
    affectsClasses: row.affects_classes
  };
}
