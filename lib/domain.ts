export type UUID = string;

export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type TaskStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED"
  | "CANCELLED";
export type TaskScope = "DAILY" | "WEEKLY";
export type ScheduledItemType = "TASK" | "CLASS" | "ACTIVITY" | "HOLIDAY";
export type ActivityStatus = "NOT_STARTED" | "COMPLETED" | "SKIPPED";
export type RepeatRule = "DAILY" | "WEEKDAYS" | "WEEKENDS" | `CUSTOM:${string}`;
export type HolidayRepeatRule = "NONE" | "YEARLY";

export type Profile = {
  id: UUID;
  fullName: string | null;
  avatarUrl: string | null;
  selectedBatch?: string | null;
};

export type AppSettings = {
  userId: UUID;
  setupCompleted: boolean;
  browserNotificationsEnabled: boolean;
  reminderBeforeMinutes: number;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  selectedBatch: string | null;
};

export type RoutineVersion = {
  id: UUID;
  versionName: string;
  sourceFile: string | null;
  fileName: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  uploadedBy: UUID | null;
  publishedAt: string | null;
  createdAt: string;
  batchesCount?: number;
  classesCount?: number;
};

export type RoutineBatch = {
  id: UUID;
  routineVersionId: UUID;
  batchCode: string;
};

export type RoutineClass = {
  id: UUID;
  routineVersionId: UUID;
  batchCode: string;
  labGroup: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  courseCode: string;
  teacher: string | null;
  room: string | null;
  classType: "Theory" | "Lab";
  roomType?: string | null;
};

export type Routine = {
  id: UUID;
  userId: UUID;
  name: string;
  term: string | null;
  active: boolean;
};

export type UniversityClass = {
  id: UUID;
  userId: UUID;
  routineId: UUID | null;
  courseName: string;
  teacher: string | null;
  room: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
  reminderEnabled: boolean;
};

export type ClassException = {
  id: UUID;
  userId: UUID;
  classId: UUID;
  date: string;
  status: "CANCELLED";
  note: string | null;
};

export type Activity = {
  id: UUID;
  userId: UUID;
  name: string;
  category: string;
  startTime: string;
  durationMinutes: number;
  repeatRule: RepeatRule;
  enabled: boolean;
  trackingEnabled: boolean;
  reminderEnabled: boolean;
};

export type ActivityHistory = {
  id: UUID;
  userId: UUID;
  activityId: UUID;
  date: string;
  status: ActivityStatus;
  completedAt: string | null;
};

export type Task = {
  id: UUID;
  userId: UUID;
  title: string;
  description: string | null;
  scope: TaskScope;
  date: string | null;
  weekStart: string | null;
  startTime: string | null;
  endTime: string | null;
  priority: Priority;
  status: TaskStatus;
  category: string | null;
  reminderEnabled: boolean;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Holiday = {
  id: UUID;
  userId: UUID;
  name: string;
  date: string;
  description: string | null;
  repeatRule: HolidayRepeatRule;
  affectsClasses: boolean;
};

export type ScheduleSource = {
  classes: UniversityClass[];
  classExceptions: ClassException[];
  activities: Activity[];
  activityHistory: ActivityHistory[];
  tasks: Task[];
  holidays: Holiday[];
  settings: AppSettings;
};

export type ScheduledItem = {
  id: string;
  sourceId: UUID;
  type: ScheduledItemType;
  title: string;
  subtitle?: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  status:
    | TaskStatus
    | ActivityStatus
    | "SCHEDULED"
    | "CANCELLED"
    | "HOLIDAY";
  priority?: Priority;
  reminderEnabled: boolean;
  trackable: boolean;
  completed: boolean;
  cancelled: boolean;
  reason?: string;
};

export type DailySchedule = {
  date: string;
  items: ScheduledItem[];
  now: ScheduledItem | null;
  next: ScheduledItem | null;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  holidayNames: string[];
  planning: {
    high: ScheduledItem[];
    medium: ScheduledItem[];
    low: ScheduledItem[];
    unscheduledWeekly: Task[];
  };
};
