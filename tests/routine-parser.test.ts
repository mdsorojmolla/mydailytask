import { describe, expect, it } from "vitest";
import { normalizeTime, parseRoutineText } from "@/lib/routine/parser";

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

  it("handles days across the week correctly", () => {
    const sampleText = `
Sunday
08:30-10:00 71_B CSE121 MSM KT-502

Monday
10:00-11:30 71_B CSE123 TA KT-503

Tuesday
02:30-04:00 71_B PHY102 AAS Room 601
`;
    const result = parseRoutineText(sampleText);
    const sunClass = result.classes.find((c) => c.courseCode === "CSE121");
    const monClass = result.classes.find((c) => c.courseCode === "CSE123");
    const tueClass = result.classes.find((c) => c.courseCode === "PHY102");

    expect(sunClass?.dayOfWeek).toBe(0); // Sunday
    expect(monClass?.dayOfWeek).toBe(1); // Monday
    expect(tueClass?.dayOfWeek).toBe(2); // Tuesday
  });
});
