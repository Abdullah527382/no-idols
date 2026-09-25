import { useState } from "react";
import { CreditCard, Download, Receipt, UserPlus, Trash2, Users } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Badge from "../../components/ui/Badge";
import { startCheckout } from "../../lib/stripe";

const PASS_OPTIONS = [
  { id: "adult-session", label: "Adult Single Session", amount: 25 },
  { id: "bulk-pass", label: "Adult Bulk Pass (10 sessions)", amount: 200 },
];

const CHILD_SESSION_FEE = 15;

export default function MemberPayments() {
  const { currentMember, payments, dependents, addDependent, removeDependent } = useApp();
  const [selectedPass, setSelectedPass] = useState(PASS_OPTIONS[0].id);
  const [selectedDependents, setSelectedDependents] = useState([]);
  const [dependentForm, setDependentForm] = useState({ name: "", ageCategory: "" });
  const [status, setStatus] = useState(null);

  if (!currentMember) return null;
  const history = payments.filter((p) => p.memberId === currentMember.id);

  const pass = PASS_OPTIONS.find((p) => p.id === selectedPass);
  const total = (pass?.amount || 0) + selectedDependents.length * CHILD_SESSION_FEE;

  function toggleDependent(id) {
    setSelectedDependents((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  async function handlePay() {
    setStatus({ message: "Starting checkout..." });
    const description = `${pass.label}${selectedDependents.length ? ` + ${selectedDependents.length} child session(s)` : ""}`;
    const result = await startCheckout({ description, amount: total });
    setStatus({ message: result.message, ok: result.ok });
  }

  async function handleAddDependent(e) {
    e.preventDefault();
    if (!dependentForm.name) return;
    await addDependent(dependentForm);
    setDependentForm({ name: "", ageCategory: "" });
  }

  function downloadReceipt(payment) {
    const content = [
      "NO IDOLS BROTHERHOOD",
      "----------------------------------",
      `Receipt #: ${payment.id}`,
      `Member: ${payment.memberName}`,
      `Type: ${payment.type}`,
      `Amount: $${payment.amount.toFixed(2)}`,
      `Status: ${payment.status}`,
      `Date: ${payment.date}`,
      "----------------------------------",
      "Thank you for staying committed to the brotherhood.",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `no-idols-receipt-${payment.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-3xl">Payment Hub</h1>
        <p className="mt-1 text-sm text-white/50">Book and pay for sessions via secure Stripe Checkout.</p>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-2 text-ember">
              <CreditCard className="h-4.5 w-4.5" />
              <span className="text-xs font-bold uppercase tracking-wide">Choose your pass</span>
            </div>
            <div className="mt-4 space-y-2">
              {PASS_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 text-sm transition ${
                    selectedPass === option.id ? "border-ember/60 bg-ember/10" : "border-line bg-charcoal hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="pass"
                      checked={selectedPass === option.id}
                      onChange={() => setSelectedPass(option.id)}
                      className="accent-ember"
                    />
                    {option.label}
                  </span>
                  <span className="font-semibold text-white">${option.amount}</span>
                </label>
              ))}
            </div>

            {dependents.length > 0 && (
              <div className="mt-4 border-t border-line pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
                  Bring dependents (${CHILD_SESSION_FEE}/each)
                </p>
                <div className="space-y-1.5">
                  {dependents.map((dep) => (
                    <label key={dep.id} className="flex items-center gap-2 text-sm text-white/70">
                      <input
                        type="checkbox"
                        checked={selectedDependents.includes(dep.id)}
                        onChange={() => toggleDependent(dep.id)}
                        className="accent-ember"
                      />
                      {dep.name} {dep.ageCategory && <span className="text-white/30">({dep.ageCategory})</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm text-white/50">Total</span>
              <span className="font-display text-2xl">${total}</span>
            </div>

            <button type="button" onClick={handlePay} className="btn-ember mt-4 w-full">
              Pay now
            </button>
            {status && <p className={`mt-2 text-xs ${status.ok === false ? "text-blood-light" : "text-white/50"}`}>{status.message}</p>}
          </div>

          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-2 text-ember">
              <Users className="h-4.5 w-4.5" />
              <span className="text-xs font-bold uppercase tracking-wide">Dependents / Kids</span>
            </div>

            <div className="mt-4 space-y-2">
              {dependents.length === 0 && <p className="text-sm text-white/40">No dependents added yet.</p>}
              {dependents.map((dep) => (
                <div key={dep.id} className="flex items-center justify-between rounded-md border border-line bg-charcoal px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{dep.name}</p>
                    {dep.ageCategory && <p className="text-xs text-white/40">{dep.ageCategory}</p>}
                  </div>
                  <button type="button" onClick={() => removeDependent(dep.id)} className="text-white/40 hover:text-blood-light">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddDependent} className="mt-4 space-y-2 border-t border-line pt-4">
              <input
                type="text"
                required
                placeholder="Child name"
                value={dependentForm.name}
                onChange={(e) => setDependentForm((prev) => ({ ...prev, name: e.target.value }))}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Age category (e.g. 6-10 yrs)"
                value={dependentForm.ageCategory}
                onChange={(e) => setDependentForm((prev) => ({ ...prev, ageCategory: e.target.value }))}
                className="input-field"
              />
              <button type="submit" className="btn-ghost w-full">
                <UserPlus className="h-4 w-4" /> Add dependent
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Receipt className="h-4.5 w-4.5 text-ember" />
          <h2 className="font-display text-xl">Payment History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-white/40">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-white/40">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
              {history.map((payment) => (
                <tr key={payment.id} className="border-b border-line/60 last:border-0">
                  <td className="py-3 text-white/70">{payment.date}</td>
                  <td className="py-3 text-white/70">{payment.type}</td>
                  <td className="py-3 font-semibold text-white">${payment.amount.toFixed(2)}</td>
                  <td className="py-3">
                    <Badge status={payment.status} />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => downloadReceipt(payment)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-ember hover:text-ember-light"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
