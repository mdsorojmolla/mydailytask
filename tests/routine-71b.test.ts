import { describe, expect, it } from "vitest";
import {
  DEFAULT_BATCH_CODE,
  OFFICIAL_ROUTINE_CLASSES_71_B
} from "@/lib/routine/default-routine";

describe("Section 71_B Official Routine", () => {
  it("belongs exclusively to section 71_B", () => {
    expect(DEFAULT_BATCH_CODE).toBe("71_B");
    for (const c of OFFICIAL_ROUTINE_CLASSES_71_B) {
      expect(c.batchCode).toBe("71_B");
    }
  });

  it("contains exactly 12 classes across Sunday through Thursday", () => {
    expect(OFFICIAL_ROUTINE_CLASSES_71_B.length).toBe(12);
  });

  it("has no classes on Friday and Saturday", () => {
    const fridayClasses = OFFICIAL_ROUTINE_CLASSES_71_B.filter((c) => c.dayOfWeek === 5);
    const saturdayClasses = OFFICIAL_ROUTINE_CLASSES_71_B.filter((c) => c.dayOfWeek === 6);
    expect(fridayClasses.length).toBe(0);
    expect(saturdayClasses.length).toBe(0);
  });

  it("has exact Sunday classes", () => {
    const sundayClasses = OFFICIAL_ROUTINE_CLASSES_71_B.filter((c) => c.dayOfWeek === 0);
    expect(sundayClasses.length).toBe(3);
    expect(sundayClasses).toEqual([
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
      }
    ]);
  });

  it("has exact Monday classes", () => {
    const mondayClasses = OFFICIAL_ROUTINE_CLASSES_71_B.filter((c) => c.dayOfWeek === 1);
    expect(mondayClasses.length).toBe(2);
    expect(mondayClasses).toEqual([
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
      }
    ]);
  });

  it("has exact Tuesday classes including 3-hour PHY103 B1 lab", () => {
    const tuesdayClasses = OFFICIAL_ROUTINE_CLASSES_71_B.filter((c) => c.dayOfWeek === 2);
    expect(tuesdayClasses.length).toBe(2);
    expect(tuesdayClasses[0]).toEqual({
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
    });
    expect(tuesdayClasses[1]).toEqual({
      batchCode: "71_B",
      labGroup: null,
      dayOfWeek: 2,
      startTime: "14:30",
      endTime: "16:00",
      courseCode: "PHY102",
      teacher: "AAS",
      room: "KT-516",
      classType: "Theory"
    });
  });

  it("has exact Wednesday parallel lab classes", () => {
    const wednesdayClasses = OFFICIAL_ROUTINE_CLASSES_71_B.filter((c) => c.dayOfWeek === 3);
    expect(wednesdayClasses.length).toBe(2);
    expect(wednesdayClasses).toEqual([
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
      }
    ]);
  });

  it("has exact Thursday morning and afternoon lab classes", () => {
    const thursdayClasses = OFFICIAL_ROUTINE_CLASSES_71_B.filter((c) => c.dayOfWeek === 4);
    expect(thursdayClasses.length).toBe(3);
    expect(thursdayClasses).toEqual([
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
    ]);
  });
});
