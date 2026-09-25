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

  try {
    // Apps Script's redirect-based response isn't readable via fetch() due to
    // CORS (no Access-Control-Allow-Origin on the redirect hop in some
    // browsers), so load it as JSONP via a <script> tag instead.
    const data = await jsonpRequest(SHEETS_WEBHOOK_URL, { action: "data" });
    return {
      ok: true,
      simulated: false,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      ok: false,
      simulated: false,
      message: err.message || "Failed to sync with Google Sheets.",
      timestamp: new Date().toISOString(),
    };
  }
}

// Fire-and-forget style action call against the Apps Script doPost handler
// (logCashPayment, logAttendance, rsvp, upsertMember, upsertSession).
// Uses mode: "no-cors" so the browser never CORS-blocks the request; the
// response is opaque (unreadable), which is fine since callers rely on
// optimistic local state updates rather than the server's reply.
export async function callSheetsAction(action, payload = {}) {
  if (!SHEETS_WEBHOOK_URL) {
    await wait(400);
    return {
      ok: true,
      simulated: true,
      message: `Simulated "${action}" (no webhook configured).`,
    };
  }

  try {
    await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...payload }),
    });
    return { ok: true, simulated: false };
  } catch (err) {
    return {
      ok: false,
      simulated: false,
      message: err.message || `Failed to run "${action}".`,
    };
  }
}

// Loads a URL via a <script> tag and resolves with the JSON payload passed to
// a uniquely-named global callback. Bypasses the Same-Origin/CORS policy
// entirely since script tags aren't subject to it (classic JSONP).
function jsonpRequest(url, params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = `sheetsCallback_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const query = new URLSearchParams({
      ...params,
      callback: callbackName,
    }).toString();
    const script = document.createElement("script");

    const cleanup = () => {
      delete window[callbackName];
      script.remove();
    };

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(
        new Error("Failed to load Google Sheets data (JSONP request failed)."),
      );
    };

    script.src = `${url}?${query}`;
    document.body.appendChild(script);
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
