/**
 * No Idols — Google Apps Script backend.
 * Deploy as a Web App (Execute as: Me, Access: Anyone) and set the resulting
 * /exec URL as VITE_GOOGLE_SHEETS_WEBHOOK_URL in the React app's .env.
 *
 * doGet(?action=data)  -> { members, sessions, payments, goals, dependents, users, rsvps }
 * doGet(?action=data&callback=fn) -> same, wrapped as JSONP for CORS-free browser fetches
 * doPost(action=...)   -> logCashPayment | logAttendance | rsvp | upsertMember | upsertSession
 *                         | upsertUser | approveUser | rejectUser
 *                         | upsertGoal | deleteGoal | upsertDependent | deleteDependent
 */

const SHEET_NAMES = {
  MEMBERS: "Members",
  SESSIONS: "Sessions",
  PAYMENTS: "Payments",
  GOALS: "Goals",
  RSVPS: "Rsvps",
  USERS: "Users",
  DEPENDENTS: "Dependents",
};

// Whitelisted emails always get Admin + Approved status.
const ADMIN_EMAILS = ["haarris82@gmail.com", "abdullah527382@gmail.com"];

const SCHEMAS = {
  [SHEET_NAMES.MEMBERS]: [
    "id", "name", "email", "phone", "tier", "paymentStatus",
    "attendanceRate", "sessionsAttended", "sessionsTotal", "goalProgress", "joined",
  ],
  [SHEET_NAMES.SESSIONS]: ["id", "title", "date", "time", "location", "poster", "description"],
  [SHEET_NAMES.PAYMENTS]: ["id", "memberId", "memberName", "amount", "type", "status", "date"],
  [SHEET_NAMES.GOALS]: ["id", "memberEmail", "label", "category", "target", "progress", "unit", "notes"],
  [SHEET_NAMES.RSVPS]: ["id", "memberId", "sessionId", "status", "updatedAt"],
  [SHEET_NAMES.USERS]: ["uid", "email", "name", "role", "status", "createdAt"],
  [SHEET_NAMES.DEPENDENTS]: ["id", "memberEmail", "name", "ageCategory", "createdAt"],
};

const SEED = {
  [SHEET_NAMES.MEMBERS]: [
    ["m-001", "Abdullah Ahmed", "abdullah527382@gmail.com", "+1 555 201 4471", "No Idols Brotherhood", "Paid", 92, 11, 12, 78, "2025-02-01"],
    ["m-002", "Harris Ahmed", "haarris82@gmail.com", "+1 555 340 8821", "No Idols Founding Member", "Paid", 100, 12, 12, 95, "2024-11-20"],
    ["m-003", "Khalid", "khalid@noidols.org", "+1 555 118 2290", "No Idols Brotherhood", "Pending", 66, 8, 12, 54, "2025-01-09"],
    ["m-004", "Anees", "anees@noidols.org", "+1 555 992 6634", "No Idols Brotherhood", "Overdue", 41, 5, 12, 22, "2025-03-14"],
    ["m-005", "Omer", "omer@noidols.org", "+1 555 774 0031", "No Idols Brotherhood", "Overdue", 33, 4, 12, 18, "2025-04-02"],
    ["m-006", "Mohammed Areeb", "areeb@noidols.org", "+1 555 662 9910", "No Idols Brotherhood", "Paid", 75, 9, 12, 60, "2025-02-20"],
  ],
  [SHEET_NAMES.SESSIONS]: [
    ["s-101", "Season of Dua: Presence Over Noise", "2026-10-02", "6:30 AM", "Riverside Community Hall", "/posters/no-idols-season-session-man-doing-dua.jpg", "A grounding session on discipline in worship and stillness before the dunya wakes up."],
    ["s-102", "Season of Fitness: Forge The Body", "2026-10-09", "5:45 AM", "Iron District Gym", "/posters/no-idols-season-fitness-session.jpg", "Conditioning circuit + brotherhood accountability check-in."],
    ["s-103", "No Idols: Full Season Lineup", "2026-10-16", "7:00 PM", "Downtown Chapter House", "/posters/no-idols-programs.jpg", "Overview of the season program tracks and brotherhood milestones."],
    ["s-104", "No Idols Revival Night", "2026-10-23", "8:00 PM", "The Foundry", "/posters/no-idols-season-event-poster-example.jpg", "Community revival gathering — open to all brothers and guests."],
  ],
  [SHEET_NAMES.PAYMENTS]: [
    ["p-9001", "m-001", "Abdullah Ahmed", 25, "Adult Session", "Paid", "2026-09-01"],
    ["p-9002", "m-002", "Harris Ahmed", 200, "Bulk Pass (10 sessions)", "Paid", "2026-09-01"],
    ["p-9003", "m-004", "Anees", 25, "Adult Session", "Overdue", "2026-08-01"],
    ["p-9004", "m-005", "Omer", 25, "Adult Session", "Overdue", "2026-08-01"],
    ["p-9005", "m-006", "Mohammed Areeb", 15, "Child Session", "Paid", "2026-09-05"],
  ],
  [SHEET_NAMES.GOALS]: [
    ["g-1", "abdullah527382@gmail.com", "Fajr in congregation", "Spiritual", 30, 24, "days", ""],
    ["g-2", "abdullah527382@gmail.com", "Quran memorization", "Spiritual", 5, 3, "pages/week", ""],
    ["g-3", "abdullah527382@gmail.com", "Strength training sessions", "Fitness", 12, 9, "sessions", ""],
    ["g-4", "haarris82@gmail.com", "5k run time", "Fitness", 25, 27, "minutes", ""],
  ],
  [SHEET_NAMES.RSVPS]: [],
  [SHEET_NAMES.USERS]: [
    ["u-001", "abdullah527382@gmail.com", "Abdullah Ahmed", "admin", "Approved", "2025-02-01"],
    ["u-002", "haarris82@gmail.com", "Harris Ahmed", "admin", "Approved", "2024-11-20"],
    ["u-003", "khalid@noidols.org", "Khalid", "member", "Approved", "2025-01-09"],
    ["u-004", "anees@noidols.org", "Anees", "member", "Approved", "2025-03-14"],
    ["u-005", "omer@noidols.org", "Omer", "member", "Approved", "2025-04-02"],
    ["u-006", "areeb@noidols.org", "Mohammed Areeb", "member", "Approved", "2025-02-20"],
  ],
  [SHEET_NAMES.DEPENDENTS]: [],
};

/** Run once manually from the Apps Script editor to create and seed all sheets. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(SCHEMAS).forEach((name) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);

    sheet.clear();
    const numCols = SCHEMAS[name].length;
    // Force plain-text format first so Sheets doesn't auto-coerce date/time-looking
    // strings (e.g. "2026-10-02", "6:30 AM") into Date serial values.
    sheet.getRange(1, 1, 1000, numCols).setNumberFormat("@");

    sheet.appendRow(SCHEMAS[name]);
    sheet.getRange(1, 1, 1, numCols).setFontWeight("bold");

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
  const callback = e && e.parameter && e.parameter.callback;

  const payload =
    action === "data"
      ? {
          members: readSheet(SHEET_NAMES.MEMBERS),
          sessions: readSheet(SHEET_NAMES.SESSIONS),
          payments: readSheet(SHEET_NAMES.PAYMENTS),
          goals: readSheet(SHEET_NAMES.GOALS),
          dependents: readSheet(SHEET_NAMES.DEPENDENTS),
          users: readSheet(SHEET_NAMES.USERS),
          rsvps: readSheet(SHEET_NAMES.RSVPS),
        }
      : { ok: false, message: "Unknown action: " + action };

  // JSONP fallback: browsers can't read Apps Script's redirect-based CORS
  // response via fetch(), so serve a <script>-loadable callback instead.
  if (callback) {
    return ContentService.createTextOutput(
      `${callback}(${JSON.stringify(payload)})`,
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return jsonResponse(payload);
}

function doPost(e) {
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, message: "Invalid JSON body" });
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
    case "upsertUser":
      return jsonResponse(upsertUser(body));
    case "approveUser":
      return jsonResponse(approveUser(body));
    case "rejectUser":
      return jsonResponse(setUserStatus(body.email, "Rejected"));
    case "upsertGoal":
      return jsonResponse(upsertGoal(body));
    case "deleteGoal":
      return jsonResponse(deleteRowById(SHEET_NAMES.GOALS, body.id));
    case "upsertDependent":
      return jsonResponse(upsertDependent(body));
    case "deleteDependent":
      return jsonResponse(deleteRowById(SHEET_NAMES.DEPENDENTS, body.id));
    default:
      return jsonResponse({ ok: false, message: "Unknown action: " + action });
  }
}

// --- Members / Payments / Sessions / Rsvps -------------------------------

function logCashPayment({ memberId, amount, type }) {
  const sheet = getSheet(SHEET_NAMES.PAYMENTS);
  const id = "p-" + Date.now();
  const member = getRowById(SHEET_NAMES.MEMBERS, memberId);
  const memberName = member ? member.name : "";
  const date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

  sheet.appendRow([id, memberId, memberName, Number(amount), type || "Cash Payment", "Paid", date]);
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
  const existingIndex = rows.findIndex((r) => r.memberId === memberId && r.sessionId === sessionId);
  const updatedAt = new Date().toISOString();

  if (existingIndex === -1) {
    sheet.appendRow(["r-" + Date.now(), memberId, sessionId, status, updatedAt]);
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

// --- Users / Auth ----------------------------------------------------------

function upsertUser({ uid, email, name, role, status }) {
  const isWhitelisted = ADMIN_EMAILS.indexOf((email || "").toLowerCase()) !== -1;
  const finalRole = isWhitelisted ? "admin" : role || "member";
  const finalStatus = isWhitelisted ? "Approved" : status || "Pending";

  const existing = findUserByEmail(email);
  if (existing) {
    updateRowByColumn(SHEET_NAMES.USERS, "email", email, {
      name: name || existing.name,
      role: finalRole,
      status: finalStatus,
      uid: uid || existing.uid,
    });
  } else {
    const createdAt = new Date().toISOString();
    appendRowFromObject(SHEET_NAMES.USERS, {
      uid: uid || "",
      email,
      name: name || email,
      role: finalRole,
      status: finalStatus,
      createdAt,
    });
  }

  ensureMemberForEmail(email, name);
  return { ok: true };
}

function approveUser({ email, role }) {
  setUserStatus(email, "Approved");
  if (role) updateRowByColumn(SHEET_NAMES.USERS, "email", email, { role });
  ensureMemberForEmail(email);
  return { ok: true };
}

function setUserStatus(email, status) {
  updateRowByColumn(SHEET_NAMES.USERS, "email", email, { status });
  return { ok: true };
}

/** Ensures an approved user has a matching Members profile row for stats/attendance. */
function ensureMemberForEmail(email, name) {
  const members = readSheet(SHEET_NAMES.MEMBERS);
  if (members.some((m) => m.email === email)) return;

  appendRowFromObject(SHEET_NAMES.MEMBERS, {
    id: "m-" + Date.now(),
    name: name || email,
    email,
    phone: "",
    tier: "No Idols Brotherhood",
    paymentStatus: "Pending",
    attendanceRate: 0,
    sessionsAttended: 0,
    sessionsTotal: 0,
    goalProgress: 0,
    joined: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
  });
}

function findUserByEmail(email) {
  return readSheet(SHEET_NAMES.USERS).find((u) => u.email === email) || null;
}

// --- Goals -----------------------------------------------------------------

function upsertGoal(goal) {
  if (goal.id) {
    const existing = getRowById(SHEET_NAMES.GOALS, goal.id);
    if (existing) {
      updateRowById(SHEET_NAMES.GOALS, goal.id, goal);
      return { ok: true, id: goal.id };
    }
  }

  const id = "g-" + Date.now();
  appendRowFromObject(SHEET_NAMES.GOALS, { ...goal, id });
  return { ok: true, id };
}

// --- Dependents --------------------------------------------------------

function upsertDependent(dependent) {
  if (dependent.id) {
    const existing = getRowById(SHEET_NAMES.DEPENDENTS, dependent.id);
    if (existing) {
      updateRowById(SHEET_NAMES.DEPENDENTS, dependent.id, dependent);
      return { ok: true, id: dependent.id };
    }
  }

  const id = "d-" + Date.now();
  const createdAt = new Date().toISOString();
  appendRowFromObject(SHEET_NAMES.DEPENDENTS, { ...dependent, id, createdAt });
  return { ok: true, id };
}

// --- Generic sheet helpers -------------------------------------------------

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
        // Guard against Sheets auto-coercing date/time-looking strings into Date cells.
        obj[header] = row[i] instanceof Date ? row[i].toISOString() : row[i];
      });
      return obj;
    });
}

function getRowById(sheetName, id) {
  return readSheet(sheetName).find((row) => row.id === id) || null;
}

function updateRowById(sheetName, id, patch) {
  return updateRowByColumn(sheetName, "id", id, patch);
}

function updateRowByColumn(sheetName, column, value, patch) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colIndex = headers.indexOf(column);
  const data = sheet.getDataRange().getValues();

  for (let r = 1; r < data.length; r++) {
    if (data[r][colIndex] === value) {
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

function deleteRowById(sheetName, id) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf("id");

  for (let r = 1; r < data.length; r++) {
    if (data[r][idCol] === id) {
      sheet.deleteRow(r + 1);
      return { ok: true };
    }
  }
  return { ok: false, message: "Row not found" };
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
