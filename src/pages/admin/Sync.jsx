import { useState } from "react";
import {
  RefreshCw,
  CheckCircle2,
  DollarSign,
  CalendarPlus,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function AdminSync() {
  const { members, lastSync, syncNow, logCashPayment, logAttendance } =
    useApp();
  const [syncing, setSyncing] = useState(false);

  const [cashForm, setCashForm] = useState({
    memberId: members[0]?.id ?? "",
    amount: "",
    type: "Monthly Dues",
  });
  const [attendanceForm, setAttendanceForm] = useState({
    memberId: members[0]?.id ?? "",
  });
  const [toast, setToast] = useState(null);

  async function handleSync() {
    setSyncing(true);
    await syncNow();
    setSyncing(false);
  }

  function handleCashSubmit(e) {
    e.preventDefault();
    if (!cashForm.amount) return;
    logCashPayment(cashForm);
    setToast("Cash payment logged and marked as Paid.");
    setCashForm((prev) => ({ ...prev, amount: "" }));
  }

  function handleAttendanceSubmit(e) {
    e.preventDefault();
    logAttendance(attendanceForm);
    setToast("Off-platform session check-in recorded.");
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-3xl">Google Sheets Sync Console</h1>
        <p className="mt-1 text-sm text-white/50">
          Keep the member sheet, attendance log, and payment ledger in sync.
        </p>
      </section>

      <section className="glass-panel flex flex-col items-start justify-between gap-4 rounded-2xl p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Connection status
          </p>
          <p className="mt-1 flex items-center gap-2 font-display text-xl">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Connected
          </p>
          <p className="mt-1 text-xs text-white/40">
            {lastSync
              ? `Last synced ${new Date(lastSync.timestamp).toLocaleString()}`
              : "Not synced yet this session."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="btn-ember"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />{" "}
          {syncing ? "Syncing..." : "Sync now"}
        </button>
      </section>

      {lastSync && (
        <p className="-mt-4 text-xs text-white/40">{lastSync.message}</p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="glass-panel rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-4.5 w-4.5 text-ember" />
            <h2 className="font-display text-xl">Log Offline Cash Payment</h2>
          </div>
          <form onSubmit={handleCashSubmit} className="space-y-3">
            <select
              value={cashForm.memberId}
              onChange={(e) =>
                setCashForm((prev) => ({ ...prev, memberId: e.target.value }))
              }
              className="input-field"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={cashForm.type}
              onChange={(e) =>
                setCashForm((prev) => ({ ...prev, type: e.target.value }))
              }
              className="input-field"
            >
              <option>Monthly Dues</option>
              <option>Event Fee</option>
              <option>Brotherhood Gear</option>
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount ($)"
              value={cashForm.amount}
              onChange={(e) =>
                setCashForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="input-field"
              required
            />
            <button type="submit" className="btn-ghost w-full">
              Log payment
            </button>
          </form>
        </section>

        <section className="glass-panel rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <CalendarPlus className="h-4.5 w-4.5 text-ember" />
            <h2 className="font-display text-xl">Log Off-Platform Check-in</h2>
          </div>
          <form onSubmit={handleAttendanceSubmit} className="space-y-3">
            <select
              value={attendanceForm.memberId}
              onChange={(e) => setAttendanceForm({ memberId: e.target.value })}
              className="input-field"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-white/40">
              Records attendance for a session that happened offline or wasn't
              RSVP'd in-app.
            </p>
            <button type="submit" className="btn-ghost w-full">
              Record check-in
            </button>
          </form>
        </section>
      </div>

      {toast && (
        <div className="rounded-md bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400 ring-1 ring-emerald-500/30">
          {toast}
        </div>
      )}
    </div>
  );
}
