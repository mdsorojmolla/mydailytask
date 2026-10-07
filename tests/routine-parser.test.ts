import { describe, expect, it } from "vitest";
import {
  exportBatchScheduleJson,
  normalizeTime,
  parseEffectiveDate,
  parseRoutineText
} from "@/lib/routine/parser";

describe("University Routine Parser", () => {
  it("normalizes times to standard 24h format", () => {
    expect(normalizeTime("08:30")).toBe("08:30");
    expect(normalizeTime("10:00")).toBe("10:00");
    expect(normalizeTime("01:00")).toBe("13:00");
    expect(normalizeTime("02:30")).toBe("14:30");
    expect(normalizeTime("04:00")).toBe("16:00");
    expect(normalizeTime("11:30")).toBe("11:30");
    expect(normalizeTime("02:30 PM")).toBe("14:30");
    expect(normalizeTime("08:30 AM")).toBe("08:30");
  });

  it("parses effective from date", () => {
    expect(parseEffectiveDate("03 October, 2026")).toBe("2026-10-03");
    expect(parseEffectiveDate("15 January 2025")).toBe("2025-01-15");
  });

  it("discovers all batches dynamically from schedule text", () => {
    const sampleText = `
Department of Computer Science & Engineering
Class Routine - Spring 2025

Sunday
08:30-10:00 71_B CSE121 MSM KT-502
10:00-11:30 71_A CSE121 TA KT-501
11:30-01:00 72_A CSE211 AAS Room 402
02:30-04:00 72_B CSE213 MHR AB-601
`;
    const result = parseRoutineText(sampleText);
    expect(result.batches).toContain("71_B");
    expect(result.batches).toContain("71_A");
    expect(result.batches).toContain("72_A");
    expect(result.batches).toContain("72_B");
    expect(result.classes.length).toBe(4);
  });

  it("treats lab groups 71_B1 and 71_B2 as belonging to main batch 71_B", () => {
    const sampleText = `
Sunday
08:30-11:30 71_B1 CSE122 MSM Lab-3
08:30-11:30 71_B2 CSE122 TA Lab-4
`;
    const result = parseRoutineText(sampleText);

    // Should NOT create separate academic batches for B1 and B2
    expect(result.batches).toContain("71_B");
    expect(result.batches).not.toContain("71_B1");
    expect(result.batches).not.toContain("71_B2");

    // Both classes must exist separately under batch 71_B with their distinct lab groups
    const b1Class = result.classes.find((c) => c.batchCode === "71_B" && c.labGroup === "B1");
    const b2Class = result.classes.find((c) => c.batchCode === "71_B" && c.labGroup === "B2");

    expect(b1Class).toBeDefined();
    expect(b1Class?.courseCode).toBe("CSE122");
    expect(b1Class?.startTime).toBe("08:30");
    expect(b1Class?.endTime).toBe("11:30");
    expect(b1Class?.classType).toBe("Lab");

    expect(b2Class).toBeDefined();
    expect(b2Class?.courseCode).toBe("CSE122");
    expect(b2Class?.startTime).toBe("08:30");
    expect(b2Class?.endTime).toBe("11:30");
    expect(b2Class?.classType).toBe("Lab");
  });

  it("extracts exact sample routine for 71_B with 3-hour merged labs matching expected JSON specification", () => {
    const realisticPdfText = `
Class Routine for CSE Program
Version V4.1
Effective From: 03 October, 2026 Prepared by: Class Routine Committee, Dept. of CSE

SATURDAY
08:30-10:00 10:00-11:30 11:30-01:00 01:00-02:30 02:30-04:00 04:00-05:30
KT-201 KT-201 CSE228(68_D) MIS KT-201 KT-201 CSE225(69_A) MSU KT-201 KT-201

SUNDAY
08:30-10:00 10:00-11:30 11:30-01:00 01:00-02:30 02:30-04:00 04:00-05:30
G1-026 CSE121(71_B) MRIS G1-026 CSE443(64_K) MTN G1-026 CSE221(69_M) AAA G1-026 AOL101(69_A) AAM G1-026 CSE213(70_F) MUH G1-026
KT-220 CSE413(65_K) TRN KT-220 CSE123(71_B) MSM KT-220 CSE315(67_P) SNA KT-220 CSE438(64_B) MSK KT-220 CSE317(67_N) RYS KT-220 ACT327(67_N) SIA
KT-306 CSE225(68_L) ZMK KT-306 CSE328(66_A) NNM KT-306 CSE328(66_C) NNM KT-306 PHY101(72_H) SSK KT-306 PHY102(71_B) AAS KT-306 CSE212(70_N) TI

MONDAY
08:30-10:00 10:00-11:30 11:30-01:00 01:00-02:30 02:30-04:00 04:00-05:30
KT-304 CSE121(71_B) MRIS KT-304 CSE225(68_H) ZS KT-304 CSE432(65_E) FH KT-304 CSE225(68_M) IEA KT-304 CSE431(65_H) SN KT-304 CSE316(66_E) MMRN
KT-320 CSE221(69_H) SEA KT-320 CSE123(71_B) MSM KT-320 CSE212(70_I) AHN KT-320 CSE215(69_H) BM KT-320 CSE212(70_H) AHN KT-320 CSE115(RE_A(3C)) AUA

TUESDAY
08:30-10:00 10:00-11:30 11:30-01:00 01:00-02:30 02:30-04:00 04:00-05:30
KT-815 (Physics Lab) KT-815 KT-815 PHY103(71_B1) AAS KT-815 PHY103(71_B1) AAS KT-815 PHY103(71_H2) SMA KT-815 PHY103(71_H2) SMA
KT-516 CSE223(68_I) ZMK KT-516 CSE223(68_D) SMTS KT-516 CSE223(68_C) SMTS KT-516 CSE227(68_M) SNK KT-516 PHY102(71_B) AAS KT-516 CSE323(RE_A(3C)) TAA

WEDNESDAY
08:30-10:00 10:00-11:30 11:30-01:00 01:00-02:30 02:30-04:00 04:00-05:30
G1-020 (COM LAB) G1-020 G1-020 CSE124(71_B2) MSM G1-020 CSE124(71_B2) MSM G1-020 G1-020
KT-810 (Electrical Circuits Lab and Basic Electronics Lab) KT-810 KT-810 CSE122(71_B1) MRIS KT-810 CSE122(71_B1) MRIS KT-810 KT-810

THURSDAY
08:30-10:00 10:00-11:30 11:30-01:00 01:00-02:30 02:30-04:00 04:00-05:30
G1-020 (COM LAB) CSE124(71_B1) MSM G1-020 CSE124(71_B1) MSM G1-020 G1-020 G1-020 G1-020
KT-816 (Physics Lab) PHY103(71_B2) AAS KT-816 PHY103(71_B2) AAS KT-816 KT-816 KT-816 KT-816
KT-809 (Electrical Circuits Lab and Digital Electronics Lab) KT-809 KT-809 CSE122(71_B2) MRIS KT-809 CSE122(71_B2) MRIS KT-809 KT-809

FRIDAY
`;

    const parsed = parseRoutineText(realisticPdfText);
    expect(parsed.versionName).toBe("V4.1");
    expect(parsed.effectiveFrom).toBe("2026-10-03");
    expect(parsed.batches).toContain("71_B");

    const json = exportBatchScheduleJson(parsed, "71_B");

    // Metadata checks
    expect(json.section).toBe("71_B");
    expect(json.routine_version).toBe("V4.1");
    expect(json.effective_from).toBe("2026-10-03");

    // Empty days
    expect(json.week.Saturday).toEqual([]);
    expect(json.week.Friday).toEqual([]);

    // Sunday checks: 3 classes
    expect(json.week.Sunday).toHaveLength(3);
    expect(json.week.Sunday[0]).toMatchObject({
      start: "08:30",
      end: "10:00",
      course_code: "CSE121",
      section: "71_B",
      teacher: "MRIS",
      room: "G1-026",
      type: "lecture"
    });
    expect(json.week.Sunday[1]).toMatchObject({
      start: "10:00",
      end: "11:30",
      course_code: "CSE123",
      section: "71_B",
      teacher: "MSM",
      room: "KT-220",
      type: "lecture"
    });
    expect(json.week.Sunday[2]).toMatchObject({
      start: "14:30",
      end: "16:00",
      course_code: "PHY102",
      section: "71_B",
      teacher: "AAS",
      room: "KT-306",
      type: "lecture"
    });

    // Monday checks: 2 classes
    expect(json.week.Monday).toHaveLength(2);
    expect(json.week.Monday[0]).toMatchObject({
      start: "08:30",
      end: "10:00",
      course_code: "CSE121",
      section: "71_B",
      teacher: "MRIS",
      room: "KT-304",
      type: "lecture"
    });
    expect(json.week.Monday[1]).toMatchObject({
      start: "10:00",
      end: "11:30",
      course_code: "CSE123",
      section: "71_B",
      teacher: "MSM",
      room: "KT-320",
      type: "lecture"
    });

    // Tuesday checks: 1 3-hour lab + 1 lecture
    expect(json.week.Tuesday).toHaveLength(2);
    expect(json.week.Tuesday[0]).toMatchObject({
      start: "11:30",
      end: "14:30",
      course_code: "PHY103",
      section: "71_B",
      lab_group: "B1",
      teacher: "AAS",
      room: "KT-815",
      room_type: "Physics Lab",
      type: "lab"
    });
    expect(json.week.Tuesday[1]).toMatchObject({
      start: "14:30",
      end: "16:00",
      course_code: "PHY102",
      section: "71_B",
      teacher: "AAS",
      room: "KT-516",
      type: "lecture"
    });

    // Wednesday checks: 2 3-hour labs (B2 and B1)
    expect(json.week.Wednesday).toHaveLength(2);
    expect(json.week.Wednesday[0]).toMatchObject({
      start: "11:30",
      end: "14:30",
      course_code: "CSE124",
      section: "71_B",
      lab_group: "B2",
      teacher: "MSM",
      room: "G1-020",
      room_type: "COM LAB",
      type: "lab"
    });
    expect(json.week.Wednesday[1]).toMatchObject({
      start: "11:30",
      end: "14:30",
      course_code: "CSE122",
      section: "71_B",
      lab_group: "B1",
      teacher: "MRIS",
      room: "KT-810",
      room_type: "Electrical Circuits Lab and Basic Electronics Lab",
      type: "lab"
    });

    // Thursday checks: 3 3-hour labs
    expect(json.week.Thursday).toHaveLength(3);
    expect(json.week.Thursday[0]).toMatchObject({
      start: "08:30",
      end: "11:30",
      course_code: "CSE124",
      section: "71_B",
      lab_group: "B1",
      teacher: "MSM",
      room: "G1-020",
      room_type: "COM LAB",
      type: "lab"
    });
    expect(json.week.Thursday[1]).toMatchObject({
      start: "08:30",
      end: "11:30",
      course_code: "PHY103",
      section: "71_B",
      lab_group: "B2",
      teacher: "AAS",
      room: "KT-816",
      room_type: "Physics Lab",
      type: "lab"
    });
    expect(json.week.Thursday[2]).toMatchObject({
      start: "11:30",
      end: "14:30",
      course_code: "CSE122",
      section: "71_B",
      lab_group: "B2",
      teacher: "MRIS",
      room: "KT-809",
      room_type: "Electrical Circuits Lab and Digital Electronics Lab",
      type: "lab"
    });
  });
});
