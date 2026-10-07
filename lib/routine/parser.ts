import path from "path";
import fs from "fs";
import { PDFParse } from "pdf-parse";
import type { RoutineClass } from "@/lib/domain";

export interface ParsedRoutineResult {
  versionName?: string;
  effectiveFrom?: string;
  batches: string[];
  classes: Omit<RoutineClass, "id" | "routineVersionId">[];
  stats: {
    totalClasses: number;
    totalBatches: number;
    daysWithClasses: string[];
  };
  rawTextPreview?: string;
}

export interface RoutineScrapedClass {
  start: string;
  end: string;
  course_code: string;
  section: string;
  lab_group?: string;
  teacher?: string | null;
  room?: string | null;
  room_type?: string | null;
  type: "lecture" | "lab";
}

export interface RoutineScrapedJson {
  section: string;
  routine_version?: string;
  effective_from?: string;
  week: {
    Saturday: RoutineScrapedClass[];
    Sunday: RoutineScrapedClass[];
    Monday: RoutineScrapedClass[];
    Tuesday: RoutineScrapedClass[];
    Wednesday: RoutineScrapedClass[];
    Thursday: RoutineScrapedClass[];
    Friday: RoutineScrapedClass[];
  };
}

export const DAY_MAP: Record<string, number> = {
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

export const DAY_NAMES: (keyof RoutineScrapedJson["week"])[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export const STANDARD_SLOTS = [
  { index: 0, label: "08:30-10:00", start: "08:30", end: "10:00" },
  { index: 1, label: "10:00-11:30", start: "10:00", end: "11:30" },
  { index: 2, label: "11:30-01:00", start: "11:30", end: "13:00" },
  { index: 3, label: "01:00-02:30", start: "13:00", end: "14:30" },
  { index: 4, label: "02:30-04:00", start: "14:30", end: "16:00" },
  { index: 5, label: "04:00-05:30", start: "16:00", end: "17:30" }
];

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
 * Parses "03 October, 2026" or "03 October 2026" into "2026-10-03"
 */
export function parseEffectiveDate(raw: string): string {
  const months: Record<string, string> = {
    january: "01", feb: "02", february: "02", mar: "03", march: "03",
    apr: "04", april: "04", may: "05", jun: "06", june: "06",
    jul: "07", july: "07", aug: "08", august: "08", sep: "09", september: "09",
    oct: "10", october: "10", nov: "11", november: "11", dec: "12", december: "12"
  };

  const match = raw.match(/(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})/);
  if (!match) return raw;

  const day = match[1].padStart(2, "0");
  const monthName = match[2].toLowerCase();
  const year = match[3];
  const month = months[monthName] || "10";

  return `${year}-${month}-${day}`;
}

let workerInitialized = false;

/**
 * Ensures PDFParse web worker is configured with a valid local path or fallback
 * so Next.js SSR and Turbopack runtimes don't fail looking for pdf.worker.mjs
 */
export function configurePdfWorker(): void {
  if (workerInitialized) return;
  try {
    const workerCandidates = [
      path.join(process.cwd(), "node_modules", "pdf-parse", "dist", "pdf-parse", "cjs", "pdf.worker.mjs"),
      path.join(process.cwd(), "node_modules", "pdf-parse", "dist", "worker", "pdf.worker.mjs"),
      path.join(process.cwd(), "node_modules", "pdf-parse", "dist", "pdf-parse", "esm", "pdf.worker.mjs")
    ];

    let foundPath: string | null = null;
    for (const cand of workerCandidates) {
      if (fs.existsSync(/*turbopackIgnore: true*/ cand)) {
        foundPath = cand;
        break;
      }
    }

    if (foundPath) {
      // In Next.js dev server, copy worker into .next/dev/server/chunks/ssr/ if directory exists
      // to satisfy any bundled relative import from Turbopack SSR
      const ssrDirs = [
        path.join(process.cwd(), ".next", "dev", "server", "chunks", "ssr"),
        path.join(process.cwd(), ".next", "server", "chunks", "ssr")
      ];
      for (const dir of ssrDirs) {
        try {
          if (fs.existsSync(/*turbopackIgnore: true*/ dir)) {
            const dest = path.join(dir, "pdf.worker.mjs");
            if (!fs.existsSync(/*turbopackIgnore: true*/ dest)) {
              fs.copyFileSync(foundPath, dest);
            }
          }
        } catch {
          // ignore directory copy errors
        }
      }

      if (typeof (PDFParse as any).setWorker === "function") {
        (PDFParse as any).setWorker(foundPath);
      }
      workerInitialized = true;
      return;
    }

    // CDN fallback if local path cannot be resolved
    if (typeof (PDFParse as any).setWorker === "function") {
      (PDFParse as any).setWorker("https://cdn.jsdelivr.net/npm/pdf-parse@2.4.5/dist/pdf-parse/web/pdf.worker.mjs");
      workerInitialized = true;
    }
  } catch (err) {
    console.warn("Could not set PDF worker explicitly:", err);
  }
}

/**
 * Fallback raw text extractor for uncompressed text streams in PDFs
 */
function fallbackExtractPdfText(buffer: Buffer | Uint8Array): string {
  try {
    const raw = Buffer.isBuffer(buffer) ? buffer.toString("latin1") : Buffer.from(buffer).toString("latin1");
    const extracted: string[] = [];
    const textRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*T[jJ]/g;
    let m;
    while ((m = textRegex.exec(raw)) !== null) {
      if (m[1]) extracted.push(m[1].replace(/\\([()\\])/g, "$1"));
    }
    return extracted.join(" ");
  } catch {
    return "";
  }
}

/**
 * Extracts plain text from a PDF Buffer
 */
export async function extractTextFromPDF(buffer: Buffer | Uint8Array): Promise<string> {
  configurePdfWorker();

  try {
    const parser = new PDFParse({ data: buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer) });
    const result = await parser.getText();
    if (result.text && result.text.trim().length > 0) {
      return result.text;
    }
  } catch (error) {
    console.warn("PDFParse getText failed, attempting fallback:", error);
  }

  // Fallback attempt
  const fallback = fallbackExtractPdfText(buffer);
  if (fallback.trim().length > 0) {
    return fallback;
  }

  throw new Error("Failed to extract text from PDF: Could not parse selectable text from document.");
}

/**
 * Parses university routine text into structured batches and classes
 */
export function parseRoutineText(text: string): ParsedRoutineResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Extract Metadata
  let versionName = "V4.1";
  let effectiveFrom = "2026-10-03";

  const versionMatch = text.match(/Version\s+([A-Za-z0-9._-]+)/i);
  if (versionMatch) {
    versionName = versionMatch[1];
  }

  const effectiveMatch = text.match(/Effective\s+From:\s*([0-9]{1,2}\s+[A-Za-z]+,?\s+[0-9]{4})/i);
  if (effectiveMatch) {
    effectiveFrom = parseEffectiveDate(effectiveMatch[1]);
  }

  const rawExtracted: Omit<RoutineClass, "id" | "routineVersionId">[] = [];
  const discoveredBatches = new Set<string>();

  let currentDay: number = 6; // Default Saturday (first day of CSE routine)
  let currentRoom: string | null = null;
  let currentRoomType: string | null = null;

  // Regex helpers
  const dayHeaderRegex = /^(SATURDAY|SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY)$/i;
  const roomHeaderRegex = /^(KT-\d{3}(?:\([A-Z]\))?|G1-\d{3}|ANX1-\d{3}|SH-\d{3}|CTBA-\d{2}|EMBED\s+LAB-KT-\d+|IOT\s+LAB.*?KT-\d+)/i;
  const roomTypeRegex = /^\((COM LAB|Physics Lab|Electrical Circuits Lab and Basic Electronics Lab|Electrical Circuits Lab and Digital Electronics Lab|Electrical Circuits Lab and Basic Electronics|Electrical Circuits Lab and Digital Electronics|IOT LAB|EMBED LAB)\)$/i;

  const timeSlotRegex = /(\d{1,2}:\d{2})\s*(?:AM|PM)?\s*[-–—to]+\s*(\d{1,2}:\d{2})\s*(?:AM|PM)?/i;
  const batchRegex = /\b(\d{2,3}_[A-Z][0-9]?)\b/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Day header check
    const dayMatch = line.match(dayHeaderRegex);
    if (dayMatch) {
      const dayKey = dayMatch[1].toLowerCase();
      if (DAY_MAP[dayKey] !== undefined) {
        currentDay = DAY_MAP[dayKey];
      }
      continue;
    }

    // 2. Room Type standalone check
    const roomTypeMatch = line.match(roomTypeRegex);
    if (roomTypeMatch) {
      currentRoomType = roomTypeMatch[1].trim();
      continue;
    }

    // 3. Room header check
    const roomMatch = line.match(roomHeaderRegex);
    if (roomMatch && !line.includes("(" + "7")) {
      currentRoom = roomMatch[1].trim();
      // Check for inline room type e.g. "KT-815 (Physics Lab)"
      const inlineRoomType = line.match(roomTypeRegex);
      if (inlineRoomType) {
        currentRoomType = inlineRoomType[1].trim();
      } else if (!lines[i + 1]?.match(roomTypeRegex)) {
        currentRoomType = null;
      }
    }

    // 4. Check if line represents a multi-column table row
    const rowClasses = parseTableRow(line, currentDay, currentRoom, currentRoomType);
    if (rowClasses.length > 0) {
      for (const item of rowClasses) {
        rawExtracted.push(item);
        discoveredBatches.add(item.batchCode);
      }
      continue;
    }

    // 5. Line-based / explicit slot format
    // e.g. "08:30-10:00 71_B CSE121 MSM KT-502" or "08:30-11:30 71_B1 CSE122 MSM Lab-3"
    const timeMatch = line.match(timeSlotRegex);
    const batchMatches = Array.from(line.matchAll(batchRegex));

    if (batchMatches.length > 0) {
      for (const bMatch of batchMatches) {
        const rawBatch = bMatch[1];
        const { mainBatch, labGroup } = parseBatchAndLabGroup(rawBatch);
        if (!mainBatch) continue;

        discoveredBatches.add(mainBatch);

        let startTime = "08:30";
        let endTime = "10:00";
        if (timeMatch) {
          startTime = normalizeTime(timeMatch[1]);
          endTime = normalizeTime(timeMatch[2]);
        }

        // Extract course code e.g. CSE121, PHY103
        const courseMatch = line.match(/\b([A-Z]{2,4}\d{3}[A-Z]?)\b/);
        const courseCode = courseMatch ? courseMatch[1] : "CSE_CLASS";

        // Teacher initials
        const teacherMatch = line.match(/\b([A-Z]{2,4})\b/);
        const teacher = teacherMatch && teacherMatch[1] !== courseCode ? teacherMatch[1] : null;

        // Room
        const room = extractRoomCode(line) || currentRoom;
        const isLab = Boolean(labGroup) || Boolean(currentRoomType) || courseCode.toLowerCase().includes("lab") || (timeMatch && calculateDurationMinutes(startTime, endTime) >= 120);

        rawExtracted.push({
          batchCode: mainBatch,
          labGroup,
          dayOfWeek: currentDay,
          startTime,
          endTime,
          courseCode,
          teacher,
          room,
          classType: isLab ? "Lab" : "Theory",
          roomType: currentRoomType || (isLab ? "Lab" : null)
        });
      }
    }
  }

  // Merge consecutive lab slots (e.g. two 90-min slots -> 3-hour lab session)
  const mergedClasses = mergeConsecutiveSlots(rawExtracted);

  const daysWithClasses = new Set<string>();
  for (const c of mergedClasses) {
    daysWithClasses.add(DAY_NAMES[c.dayOfWeek] || `Day ${c.dayOfWeek}`);
  }

  const sortedBatches = Array.from(discoveredBatches).sort();

  return {
    versionName,
    effectiveFrom,
    batches: sortedBatches,
    classes: mergedClasses,
    stats: {
      totalClasses: mergedClasses.length,
      totalBatches: sortedBatches.length,
      daysWithClasses: Array.from(daysWithClasses)
    },
    rawTextPreview: lines.slice(0, 40).join("\n")
  };
}

/**
 * Parses a table row formatted across the 6 slot columns
 */
function parseTableRow(
  line: string,
  dayOfWeek: number,
  fallbackRoom: string | null,
  fallbackRoomType: string | null
): Omit<RoutineClass, "id" | "routineVersionId">[] {
  const result: Omit<RoutineClass, "id" | "routineVersionId">[] = [];

  // Identify room prefix: e.g. KT-208, G1-026, ANX1-101, KT-815, G1-020, etc.
  const roomPrefixMatch = line.match(/^(KT-\d{3}(?:\([A-Z]\))?|G1-\d{3}|ANX1-\d{3}|SH-\d{3}|CTBA-\d{2})\b/i);
  const room = roomPrefixMatch ? roomPrefixMatch[1] : fallbackRoom;
  if (!room) return result;

  // Extract inline room type if present e.g. (COM LAB), (Physics Lab)
  let roomType = fallbackRoomType;
  const roomTypeMatch = line.match(/\((COM LAB|Physics Lab|Electrical Circuits Lab and Basic Electronics Lab|Electrical Circuits Lab and Digital Electronics Lab)\)/i);
  if (roomTypeMatch) {
    roomType = roomTypeMatch[1];
  }

  // Check if line repeats the room code across columns
  // e.g. "G1-026 CSE121(71_B) MRIS G1-026 CSE443(64_K) MTN G1-026 CSE221(69_M) AAA ..."
  const escapedRoom = room.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const roomRegex = new RegExp(`(?:(?<=^|\\s)${escapedRoom}(?=\\s|$))`, "g");

  const rawSegments: string[] = line.split(roomRegex).map((s) => s.trim());
  if (rawSegments.length >= 2) {
    // If the line starts with the room, rawSegments[0] is ""
    const cells = rawSegments[0] === "" ? rawSegments.slice(1) : rawSegments;

    for (let slotIdx = 0; slotIdx < Math.min(cells.length, 6); slotIdx++) {
      const cellText = cells[slotIdx];
      if (!cellText) continue;

      const cellRoomTypeMatch = cellText.match(/\((COM LAB|Physics Lab|Electrical Circuits Lab and Basic Electronics Lab|Electrical Circuits Lab and Digital Electronics Lab)\)/i);
      const effectiveRoomType = cellRoomTypeMatch ? cellRoomTypeMatch[1] : roomType;

      const classMatch = cellText.match(/([A-Z]{2,4}\d{3}[A-Z]?)\(([^)]+)\)\s+([A-Z0-9_\-]+)/);
      if (classMatch) {
        const courseCode = classMatch[1];
        const rawBatch = classMatch[2].trim();
        const teacher = classMatch[3];

        const { mainBatch, labGroup } = parseBatchAndLabGroup(rawBatch);
        if (!mainBatch) continue;

        const slot = STANDARD_SLOTS[slotIdx] || STANDARD_SLOTS[0];
        const isLab = Boolean(labGroup) || Boolean(effectiveRoomType) || courseCode.toLowerCase().includes("lab");

        result.push({
          batchCode: mainBatch,
          labGroup,
          dayOfWeek,
          startTime: slot.start,
          endTime: slot.end,
          courseCode,
          teacher,
          room,
          classType: isLab ? "Lab" : "Theory",
          roomType: effectiveRoomType || (isLab ? "Lab" : null)
        });
      }
    }
  }

  return result;
}

/**
 * Extracts batch and lab group from routine notation:
 * "71_B" -> { mainBatch: "71_B", labGroup: null }
 * "71_B1" -> { mainBatch: "71_B", labGroup: "B1" }
 * "71_B2" -> { mainBatch: "71_B", labGroup: "B2" }
 * "72_Q1" -> { mainBatch: "72_Q", labGroup: "Q1" }
 */
export function parseBatchAndLabGroup(raw: string): { mainBatch: string | null; labGroup: string | null } {
  const cleaned = raw.trim();

  // Pattern: (\d{2,3})_([A-Za-z])([0-9])? e.g. 71_B or 71_B1
  const match = cleaned.match(/^(\d{2,3})[_-]([A-Za-z])([0-9])?$/);
  if (match) {
    const sem = match[1];
    const sectionLetter = match[2].toUpperCase();
    const groupNum = match[3];

    const mainBatch = `${sem}_${sectionLetter}`;
    const labGroup = groupNum ? `${sectionLetter}${groupNum}` : null;
    return { mainBatch, labGroup };
  }

  // Handle generic section code e.g. 68_D, 69_A
  const simpleMatch = cleaned.match(/^(\d{2,3}[_-][A-Za-z])/);
  if (simpleMatch) {
    return { mainBatch: simpleMatch[1], labGroup: null };
  }

  return { mainBatch: null, labGroup: null };
}

function calculateDurationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

function extractRoomCode(line: string): string | null {
  const match = line.match(/\b(KT-\d{3}(?:\([A-Z]\))?|G1-\d{3}|ANX1-\d{3}|SH-\d{3}|CTBA-\d{2}|Room[- ]\d+|Lab[- ]\d+)\b/i);
  return match ? match[1] : null;
}

/**
 * Merges consecutive 90-minute lab slots into single 3-hour sessions
 * e.g. 11:30-13:00 + 13:00-14:30 -> 11:30-14:30
 */
function mergeConsecutiveSlots(
  classes: Omit<RoutineClass, "id" | "routineVersionId">[]
): Omit<RoutineClass, "id" | "routineVersionId">[] {
  if (classes.length === 0) return [];

  // Group classes by day and batch
  const grouped = new Map<string, Omit<RoutineClass, "id" | "routineVersionId">[]>();

  for (const c of classes) {
    const key = `${c.dayOfWeek}_${c.batchCode}_${c.courseCode}_${c.labGroup ?? "ALL"}_${c.room ?? ""}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(c);
  }

  const merged: Omit<RoutineClass, "id" | "routineVersionId">[] = [];

  for (const group of grouped.values()) {
    // Sort by start time
    group.sort((a, b) => a.startTime.localeCompare(b.startTime));

    let current = { ...group[0] };

    for (let i = 1; i < group.length; i++) {
      const next = group[i];
      // Check if current.endTime equals next.startTime
      if (current.endTime === next.startTime) {
        // Merge into one longer slot
        current.endTime = next.endTime;
        current.classType = "Lab";
      } else {
        merged.push(current);
        current = { ...next };
      }
    }
    merged.push(current);
  }

  // Sort by dayOfWeek then startTime
  merged.sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.startTime.localeCompare(b.startTime);
  });

  return merged;
}

/**
 * Exports the structured weekly schedule JSON for a specific section/batch,
 * exactly matching the user's scraping format specification.
 */
export function exportBatchScheduleJson(
  result: ParsedRoutineResult,
  batchCode: string
): RoutineScrapedJson {
  const batchClasses = result.classes.filter((c) => c.batchCode === batchCode);

  const week: RoutineScrapedJson["week"] = {
    Saturday: [],
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
  };

  for (const c of batchClasses) {
    const dayName = DAY_NAMES[c.dayOfWeek];
    if (!dayName) continue;

    const item: RoutineScrapedClass = {
      start: c.startTime,
      end: c.endTime,
      course_code: c.courseCode,
      section: c.batchCode,
      teacher: c.teacher,
      room: c.room,
      type: c.classType === "Lab" ? "lab" : "lecture"
    };

    if (c.labGroup) {
      item.lab_group = c.labGroup;
    }
    if (c.roomType) {
      item.room_type = c.roomType;
    }

    week[dayName].push(item);
  }

  // Sort each day's classes by start time
  for (const day of Object.keys(week) as (keyof RoutineScrapedJson["week"])[]) {
    week[day].sort((a, b) => a.start.localeCompare(b.start));
  }

  return {
    section: batchCode,
    routine_version: result.versionName || "V4.1",
    effective_from: result.effectiveFrom || "2026-10-03",
    week
  };
}
