// POC stand-in for a Google Sheets API v4 / Apps Script Webhook sync.
// In production, point this at the deployed Apps Script web app URL and
// POST/GET member, attendance, and payment rows.
const SHEETS_WEBHOOK_URL = import.meta.env.VITE_SHEETS_WEBHOOK_URL || ''

export async function syncWithSheets() {
  if (!SHEETS_WEBHOOK_URL) {
    await wait(900)
    return {
      ok: true,
      simulated: true,
      message: 'Simulated sync complete. Set VITE_SHEETS_WEBHOOK_URL to connect the live Google Sheet.',
      timestamp: new Date().toISOString(),
    }
  }

  const res = await fetch(SHEETS_WEBHOOK_URL)
  const data = await res.json()
  return { ok: res.ok, simulated: false, data, timestamp: new Date().toISOString() }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
