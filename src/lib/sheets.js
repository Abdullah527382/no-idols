// Backed by the Apps Script web app in apps-script/Code.gs. Deploy that
// script and set VITE_SHEETS_WEBHOOK_URL to its /exec URL to go live.
const SHEETS_WEBHOOK_URL = import.meta.env.VITE_SHEETS_WEBHOOK_URL || "";

export async function syncWithSheets() {
  if (!SHEETS_WEBHOOK_URL) {
    await wait(900);
    return {
      ok: true,
      simulated: true,
      message:
        "Simulated sync complete. Set VITE_SHEETS_WEBHOOK_URL to connect the live Google Sheet.",
      timestamp: new Date().toISOString(),
    };
  }

  const res = await fetch(`${SHEETS_WEBHOOK_URL}?action=data`);
  const data = await res.json();
  return {
    ok: res.ok,
    simulated: false,
    data,
    timestamp: new Date().toISOString(),
  };
}

// Fire-and-forget style action call against the Apps Script doPost handler
// (logCashPayment, logAttendance, rsvp, upsertMember, upsertSession).
export async function callSheetsAction(action, payload = {}) {
  if (!SHEETS_WEBHOOK_URL) {
    await wait(400);
    return { ok: true, simulated: true, message: `Simulated "${action}" (no webhook configured).` };
  }

  const res = await fetch(SHEETS_WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
