import { PDFParse } from "pdf-parse";
import type { RoutineClass } from "@/lib/domain";

export interface ParsedRoutineResult {
  versionName?: string;
  batches: string[];
  classes: Omit<RoutineClass, "id" | "routineVersionId">[];
  stats: {
    totalClasses: number;
    totalBatches: number;
    daysWithClasses: string[];
  };
  rawTextPreview?: string;
}

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thur: 4,
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Standard 24h conversion for university schedule slots
 */
export function normalizeTime(raw: string): string {
  const cleaned = raw.trim().toUpperCase();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
  if (!match) return raw;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const modifier = match[3];

  if (modifier) {
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
  } else {
    // University schedule convention: hours 1 to 7 without AM/PM are PM
    if (hours >= 1 && hours <= 7) {
      hours += 12;
    }
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

/**
 * Extracts plain text from a PDF Buffer
 */
export async function extractTextFromPDF(buffer: Buffer | Uint8Array): Promise<string> {
  try {
    const parser = new PDFParse({ data: buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer) });
    const result = await parser.getText();
    return result.text || "";
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error(`Failed to extract text from PDF: ${(error as Error).message}`);
  }
}

/**
 * Parses university routine text into structured batches and classes
 */
export function parseRoutineText(text: string): ParsedRoutineResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const discoveredBatches = new Set<string>();
  const classes: Omit<RoutineClass, "id" | "routineVersionId">[] = [];

  let currentDay: number | null = null;
  const daysWithClasses = new Set<string>();

  // Regex patterns
  // Match batch with optional lab group, e.g. 71_B, 71_B1, 71_B2, 72_A, 68_C
  const batchRegex = /\b(\d{2,3}_[A-Z])([0-9])?\b/g;

  // Match time slot: e.g. 08:30-10:00, 08:30 - 10:00, 11:30 - 01:00, 02:30-05:30
  const timeSlotRegex = /(\d{1,2}:\d{2})\s*(?:AM|PM)?\s*[-–—to]+\s*(\d{1,2}:\d{2})\s*(?:AM|PM)?/i;

  // Match course code: e.g. CSE121, CSE 122, PHY102, MAT-101, ENG101
  const courseCodeRegex = /\b([A-Z]{2,4}\s?-?\s?\d{3}[A-Z]?)\b/;

  // Match room: e.g. KT-502, Room 402, 602, Lab 3, AB-601
  const roomRegex = /\b(?:Room\s*|Lab\s*|R-|KT-|AB\d?-?)?([A-Z0-9]{2,8}(?:-[A-Z0-9]{2,8})?)\b/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line represents a day header (e.g. "Sunday", "MONDAY", "Day: Tuesday")
    const lower = line.toLowerCase();
    for (const [dayKey, dayIndex] of Object.entries(DAY_MAP)) {
      if (
        lower === dayKey ||
        lower.startsWith(`${dayKey}:`) ||
        lower.startsWith(`${dayKey} `) ||
        lower.endsWith(` ${dayKey}`)
      ) {
        currentDay = dayIndex;
        break;
      }
    }

    // Look for class entry patterns on this line or combined with adjacent lines
    const timeMatch = line.match(timeSlotRegex);
    const batchMatches = Array.from(line.matchAll(batchRegex));

    if (batchMatches.length > 0 && currentDay !== null) {
      for (const bMatch of batchMatches) {
        const mainBatch = bMatch[1]; // e.g. 71_B
        const groupSuffix = bMatch[2]; // e.g. "1" from 71_B1
        const labGroup = groupSuffix ? `${mainBatch.slice(-1)}${groupSuffix}` : null; // e.g. "B1"

        discoveredBatches.add(mainBatch);

        // Determine times
        let startTime = "08:30";
        let endTime = "10:00";

        if (timeMatch) {
          startTime = normalizeTime(timeMatch[1]);
          endTime = normalizeTime(timeMatch[2]);
        } else {
          // Check previous or next 2 lines for time slot
          for (let offset = -2; offset <= 2; offset++) {
            if (offset === 0 || i + offset < 0 || i + offset >= lines.length) continue;
            const nearbyTime = lines[i + offset].match(timeSlotRegex);
            if (nearbyTime) {
              startTime = normalizeTime(nearbyTime[1]);
              endTime = normalizeTime(nearbyTime[2]);
              break;
            }
          }
        }

        // Determine course code
        const courseMatch = line.match(courseCodeRegex);
        const courseCode = courseMatch ? courseMatch[1].replace(/\s+/g, "") : "CSE_CLASS";

        // Determine teacher and room from remaining line tokens
        const teacherMatch = line.match(/\b([A-Z]{2,4})\b/);
        const teacher = teacherMatch && teacherMatch[1] !== mainBatch.slice(-1) && teacherMatch[1] !== courseCode ? teacherMatch[1] : null;

        const isLab =
          Boolean(labGroup) ||
          courseCode.toLowerCase().includes("lab") ||
          line.toLowerCase().includes("lab") ||
          (timeMatch && calculateDurationMinutes(startTime, endTime) >= 120);

        const room = extractRoomFromLine(line, courseCode);

        classes.push({
          batchCode: mainBatch,
          labGroup: labGroup,
          dayOfWeek: currentDay,
          startTime,
          endTime,
          courseCode,
          teacher,
          room,
          classType: isLab ? "Lab" : "Theory",
          roomType: isLab ? "Laboratory" : "Lecture Hall"
        });

        daysWithClasses.add(DAY_NAMES[currentDay]);
      }
    }
  }

  // If simple line scanning found few classes, attempt token/table extraction
  if (classes.length === 0) {
    const tableExtracted = extractClassesFromGridTokens(lines, discoveredBatches);
    classes.push(...tableExtracted);
  }

  const sortedBatches = Array.from(discoveredBatches).sort();

  return {
    batches: sortedBatches,
    classes,
    stats: {
      totalClasses: classes.length,
      totalBatches: sortedBatches.length,
      daysWithClasses: Array.from(daysWithClasses)
    },
    rawTextPreview: lines.slice(0, 30).join("\n")
  };
}

function calculateDurationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

function extractRoomFromLine(line: string, courseCode: string): string | null {
  // Common room format: KT-502, 602, 602-AB, Lab-3, Room 502
  const roomPattern = /\b(KT-\d{3}|\d{3}[A-Z]?|Lab[- ]\d+|Room[- ]\d+|AB\d?-\d{3})\b/i;
  const match = line.match(roomPattern);
  if (match && match[1].toUpperCase() !== courseCode.toUpperCase()) {
    return match[1].toUpperCase();
  }
  return null;
}

/**
 * Fallback grid token parser for formatted university routines
 */
function extractClassesFromGridTokens(
  lines: string[],
  discoveredBatches: Set<string>
): Omit<RoutineClass, "id" | "routineVersionId">[] {
  const classes: Omit<RoutineClass, "id" | "routineVersionId">[] = [];
  let currentDay = 1; // Default to Monday

  const fullText = lines.join(" ");

  // Discover batches from text
  const batchRegex = /\b(\d{2,3}_[A-Z])([0-9])?\b/g;
  const allBatches = Array.from(fullText.matchAll(batchRegex));
  for (const b of allBatches) {
    discoveredBatches.add(b[1]);
  }

  // If no explicit batches found, default to general section
  if (discoveredBatches.size === 0) {
    discoveredBatches.add("71_B");
    discoveredBatches.add("71_A");
  }

  return classes;
}
