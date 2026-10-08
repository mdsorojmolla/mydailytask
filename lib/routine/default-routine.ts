import type { RoutineClass } from "@/lib/domain";

export const DEFAULT_BATCH_CODE = "71_B";

export interface RoutineClassDef {
  batchCode: string;
  labGroup: string | null;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string;
  endTime: string;
  courseCode: string;
  teacher: string | null;
  room: string | null;
  classType: "Theory" | "Lab";
  roomType?: string | null;
}

/**
 * Official Routine for SECTION: 71_B
 * 
 * Rules:
 * - 71_B is the main student section.
 * - B1 and B2 are lab-group identifiers belonging to section 71_B.
 * - Do not treat B1/B2 as separate academic sections.
 * - A 3-hour lab occupies two consecutive 90-minute routine slots (e.g. 11:30-14:30 or 08:30-11:30).
 * - Course codes only (no invented full course names).
 * - Saturday and Friday have no 71_B classes in this routine.
 * - Teacher initials and room names preserved exactly as provided.
 */
export const OFFICIAL_ROUTINE_CLASSES_71_B: RoutineClassDef[] = [
  // Sunday (dayOfWeek: 0)
  {
    batchCode: "71_B",
    labGroup: null,
    dayOfWeek: 0,
    startTime: "08:30",
    endTime: "10:00",
    courseCode: "CSE121",
    teacher: "MRIS",
    room: "G1-026",
    classType: "Theory"
  },
  {
    batchCode: "71_B",
    labGroup: null,
    dayOfWeek: 0,
    startTime: "10:00",
    endTime: "11:30",
    courseCode: "CSE123",
    teacher: "MSM",
    room: "KT-220",
    classType: "Theory"
  },
  {
    batchCode: "71_B",
    labGroup: null,
    dayOfWeek: 0,
    startTime: "14:30",
    endTime: "16:00",
    courseCode: "PHY102",
    teacher: "AAS",
    room: "KT-306",
    classType: "Theory"
  },

  // Monday (dayOfWeek: 1)
  {
    batchCode: "71_B",
    labGroup: null,
    dayOfWeek: 1,
    startTime: "08:30",
    endTime: "10:00",
    courseCode: "CSE121",
    teacher: "MRIS",
    room: "KT-304",
    classType: "Theory"
  },
  {
    batchCode: "71_B",
    labGroup: null,
    dayOfWeek: 1,
    startTime: "10:00",
    endTime: "11:30",
    courseCode: "CSE123",
    teacher: "MSM",
    room: "KT-320",
    classType: "Theory"
  },

  // Tuesday (dayOfWeek: 2)
  {
    batchCode: "71_B",
    labGroup: "B1",
    dayOfWeek: 2,
    startTime: "11:30",
    endTime: "14:30",
    courseCode: "PHY103",
    teacher: "AAS",
    room: "KT-815 Physics Lab",
    classType: "Lab",
    roomType: "Lab"
  },
  {
    batchCode: "71_B",
    labGroup: null,
    dayOfWeek: 2,
    startTime: "14:30",
    endTime: "16:00",
    courseCode: "PHY102",
    teacher: "AAS",
    room: "KT-516",
    classType: "Theory"
  },

  // Wednesday (dayOfWeek: 3)
  {
    batchCode: "71_B",
    labGroup: "B2",
    dayOfWeek: 3,
    startTime: "11:30",
    endTime: "14:30",
    courseCode: "CSE124",
    teacher: "MSM",
    room: "G1-020 COM LAB",
    classType: "Lab",
    roomType: "Lab"
  },
  {
    batchCode: "71_B",
    labGroup: "B1",
    dayOfWeek: 3,
    startTime: "11:30",
    endTime: "14:30",
    courseCode: "CSE122",
    teacher: "MRIS",
    room: "KT-810 Electrical Circuits Lab and Basic Electronics Lab",
    classType: "Lab",
    roomType: "Lab"
  },

  // Thursday (dayOfWeek: 4)
  {
    batchCode: "71_B",
    labGroup: "B1",
    dayOfWeek: 4,
    startTime: "08:30",
    endTime: "11:30",
    courseCode: "CSE124",
    teacher: "MSM",
    room: "G1-020 COM LAB",
    classType: "Lab",
    roomType: "Lab"
  },
  {
    batchCode: "71_B",
    labGroup: "B2",
    dayOfWeek: 4,
    startTime: "08:30",
    endTime: "11:30",
    courseCode: "PHY103",
    teacher: "AAS",
    room: "KT-816 Physics Lab",
    classType: "Lab",
    roomType: "Lab"
  },
  {
    batchCode: "71_B",
    labGroup: "B2",
    dayOfWeek: 4,
    startTime: "11:30",
    endTime: "14:30",
    courseCode: "CSE122",
    teacher: "MRIS",
    room: "KT-809 Electrical Circuits Lab and Digital Electronics Lab",
    classType: "Lab",
    roomType: "Lab"
  }
];
