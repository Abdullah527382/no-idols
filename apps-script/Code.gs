/**
 * No Idols — Google Apps Script backend.
 * Deploy as a Web App (Execute as: Me, Access: Anyone with the link) and set
 * the resulting /exec URL as VITE_SHEETS_WEBHOOK_URL in the React app's .env.
 *
 * doGet(?action=data)  -> { members, sessions, payments, goals }
 * doPost(action=...)   -> logCashPayment | logAttendance | rsvp | upsertMember | upsertSession
 */

const SHEET_NAMES = {
  MEMBERS: "Members",
  SESSIONS: "Sessions",
  PAYMENTS: "Payments",
  GOALS: "Goals",
  RSVPS: "Rsvps",
};

const SCHEMAS = {
  [SHEET_NAMES.MEMBERS]: [
    "id",
    "name",
    "phone",
    "tier",
    "paymentStatus",
    "attendanceRate",
    "sessionsAttended",
    "sessionsTotal",
    "goalProgress",
    "joined",
  ],
  [SHEET_NAMES.SESSIONS]: [
    "id",
    "title",
    "date",
    "time",
    "location",
    "poster",
    "description",
  ],
  [SHEET_NAMES.PAYMENTS]: [
    "id",
    "memberId",
    "memberName",
    "amount",
    "type",
    "status",
    "date",
  ],
  [SHEET_NAMES.GOALS]: [
    "id",
    "memberId",
    "label",
    "category",
    "target",
    "progress",
    "unit",
  ],
  [SHEET_NAMES.RSVPS]: ["id", "memberId", "sessionId", "status", "updatedAt"],
};

const SEED = {
  [SHEET_NAMES.MEMBERS]: [
    [
      "m-001",
      "Ahmed Bilal",
      "+1 555 201 4471",
      "No Idols Brotherhood",
      "Paid",
      92,
      11,
      12,
      78,
      "2025-02-01",
    ],
    [
      "m-002",
      "Yusuf Khan",
      "+1 555 340 8821",
      "No Idols Brotherhood",
      "Overdue",
      41,
      5,
      12,
      22,
      "2025-03-14",
    ],
    [
      "m-003",
      "Ibrahim Osei",
      "+1 555 118 2290",
      "No Idols Founding Member",
      "Paid",
      100,
      12,
      12,
      95,
      "2024-11-20",
    ],
    [
      "m-004",
      "Musa Abdi",
      "+1 555 992 6634",
      "No Idols Brotherhood",
      "Pending",
      66,
      8,
      12,
      54,
      "2025-01-09",
    ],
    [
      "m-005",
      "Zayd Rahman",
      "+1 555 774 0031",
      "No Idols Brotherhood",
      "Overdue",
      33,
      4,
      12,
      18,
      "2025-04-02",
    ],
  ],
  [SHEET_NAMES.SESSIONS]: [
    [
      "s-101",
      "Season of Dua: Presence Over Noise",
      "2026-10-02",
      "6:30 AM",
      "Riverside Community Hall",
      "/posters/no-idols-season-session-man-doing-dua.jpg",
      "A grounding session on discipline in worship and stillness before the dunya wakes up.",
    ],
    [
      "s-102",
      "Season of Fitness: Forge The Body",
      "2026-10-09",
      "5:45 AM",
      "Iron District Gym",
      "/posters/no-idols-season-fitness-session.jpg",
      "Conditioning circuit + brotherhood accountability check-in.",
    ],
    [
      "s-103",
      "No Idols: Full Season Lineup",
      "2026-10-16",
      "7:00 PM",
      "Downtown Chapter House",
      "/posters/no-idols-programs.jpg",
      "Overview of the season program tracks and brotherhood milestones.",
    ],
    [
      "s-104",
      "No Idols Revival Night",
      "2026-10-23",
      "8:00 PM",
      "The Foundry",
      "/posters/no-idols-season-event-poster-example.jpg",
      "Community revival gathering — open to all brothers and guests.",
    ],
  ],
  [SHEET_NAMES.PAYMENTS]: [
    [
      "p-9001",
      "m-001",
      "Ahmed Bilal",
      40,
      "Monthly Dues",
      "Paid",
      "2026-09-01",
    ],
    [
      "p-9002",
      "m-003",
      "Ibrahim Osei",
      40,
      "Monthly Dues",
      "Paid",
      "2026-09-01",
    ],
    ["p-9003", "m-004", "Musa Abdi", 25, "Event Fee", "Pending", "2026-09-18"],
    [
      "p-9004",
      "m-002",
      "Yusuf Khan",
      40,
      "Monthly Dues",
      "Overdue",
      "2026-08-01",
    ],
    [
      "p-9005",
      "m-005",
      "Zayd Rahman",
      40,
      "Monthly Dues",
      "Overdue",
      "2026-08-01",
    ],
  ],
  [SHEET_NAMES.GOALS]: [
    ["g-1", "m-001", "Fajr in congregation", "Spiritual", 30, 24, "days"],
    ["g-2", "m-001", "Quran memorization", "Spiritual", 5, 3, "pages/week"],
    [
      "g-3",
      "m-001",
      "Strength training sessions",
      "Fitness",
      12,
      9,
      "sessions",
    ],
    ["g-4", "m-001", "5k run time", "Fitness", 25, 27, "minutes"],
  ],
  [SHEET_NAMES.RSVPS]: [],
};

/** Run once manually from the Apps Script editor to create and seed all sheets. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(SCHEMAS).forEach((name) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);

    sheet.clear();
    sheet.appendRow(SCHEMAS[name]);
    sheet.getRange(1, 1, 1, SCHEMAS[name].length).setFontWeight("bold");

    const rows = SEED[name];
    if (rows && rows.length) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }
  });

  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) ss.deleteSheet(defaultSheet);
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "data";

  if (action === "data") {
    return jsonResponse({
      members: readSheet(SHEET_NAMES.MEMBERS),
      sessions: readSheet(SHEET_NAMES.SESSIONS),
      payments: readSheet(SHEET_NAMES.PAYMENTS),
      goals: readSheet(SHEET_NAMES.GOALS),
      rsvps: readSheet(SHEET_NAMES.RSVPS),
    });
  }

  return jsonResponse({ ok: false, message: "Unknown action: " + action }, 400);
}

function doPost(e) {
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, message: "Invalid JSON body" }, 400);
  }

  const action = body.action;

  switch (action) {
    case "logCashPayment":
      return jsonResponse(logCashPayment(body));
    case "logAttendance":
      return jsonResponse(logAttendance(body));
    case "rsvp":
      return jsonResponse(upsertRsvp(body));
    case "upsertMember":
      return jsonResponse(upsertMember(body));
    case "upsertSession":
      return jsonResponse(upsertSession(body));
    default:
      return jsonResponse(
        { ok: false, message: "Unknown action: " + action },
        400,
      );
  }
}

function logCashPayment({ memberId, amount, type }) {
  const sheet = getSheet(SHEET_NAMES.PAYMENTS);
  const id = "p-" + Date.now();
  const memberName = getRowById(SHEET_NAMES.MEMBERS, memberId).name;
  const date = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd",
  );

  sheet.appendRow([
    id,
    memberId,
    memberName,
    Number(amount),
    type || "Cash Payment",
    "Paid",
    date,
  ]);
  updateRowById(SHEET_NAMES.MEMBERS, memberId, { paymentStatus: "Paid" });

  return { ok: true, id };
}

function logAttendance({ memberId }) {
  const member = getRowById(SHEET_NAMES.MEMBERS, memberId);
  if (!member) return { ok: false, message: "Member not found" };

  const attended = Math.min(member.sessionsAttended + 1, member.sessionsTotal);
  const rate = Math.round((attended / member.sessionsTotal) * 100);

  updateRowById(SHEET_NAMES.MEMBERS, memberId, {
    sessionsAttended: attended,
    attendanceRate: rate,
  });

  return { ok: true };
}

function upsertRsvp({ memberId, sessionId, status }) {
  const sheet = getSheet(SHEET_NAMES.RSVPS);
  const rows = readSheet(SHEET_NAMES.RSVPS);
  const existingIndex = rows.findIndex(
    (r) => r.memberId === memberId && r.sessionId === sessionId,
  );
  const updatedAt = new Date().toISOString();

  if (existingIndex === -1) {
    sheet.appendRow([
      "r-" + Date.now(),
      memberId,
      sessionId,
      status,
      updatedAt,
    ]);
  } else {
    const rowNumber = existingIndex + 2; // +1 header, +1 1-indexed
    sheet.getRange(rowNumber, 4, 1, 2).setValues([[status, updatedAt]]);
  }

  return { ok: true };
}

function upsertMember(member) {
  const existing = getRowById(SHEET_NAMES.MEMBERS, member.id);
  if (existing) {
    updateRowById(SHEET_NAMES.MEMBERS, member.id, member);
  } else {
    appendRowFromObject(SHEET_NAMES.MEMBERS, member);
  }
  return { ok: true };
}

function upsertSession(session) {
  const existing = getRowById(SHEET_NAMES.SESSIONS, session.id);
  if (existing) {
    updateRowById(SHEET_NAMES.SESSIONS, session.id, session);
  } else {
    appendRowFromObject(SHEET_NAMES.SESSIONS, session);
  }
  return { ok: true };
}

// --- Sheet helpers -------------------------------------------------------

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function readSheet(name) {
  const sheet = getSheet(name);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  const [headers, ...rows] = values;

  return rows
    .filter((row) => row.some((cell) => cell !== ""))
    .map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
}

function getRowById(sheetName, id) {
  return readSheet(sheetName).find((row) => row.id === id) || null;
}

function updateRowById(sheetName, id, patch) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idCol = headers.indexOf("id");
  const data = sheet.getDataRange().getValues();

  for (let r = 1; r < data.length; r++) {
    if (data[r][idCol] === id) {
      headers.forEach((header, c) => {
        if (Object.prototype.hasOwnProperty.call(patch, header)) {
          sheet.getRange(r + 1, c + 1).setValue(patch[header]);
        }
      });
      return true;
    }
  }
  return false;
}

function appendRowFromObject(sheetName, obj) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(headers.map((header) => obj[header] ?? ""));
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
