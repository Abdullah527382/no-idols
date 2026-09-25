import { useState } from "react";
import { CreditCard, Download, Receipt } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Badge from "../../components/ui/Badge";
import { startCheckout } from "../../lib/stripe";

const DUE_OPTIONS = [
  { id: "dues", label: "Monthly Dues", amount: 40 },
  { id: "event", label: "Event Fee", amount: 25 },
  { id: "gear", label: "Brotherhood Gear", amount: 60 },
];

export default function MemberPayments() {
  const { currentMember, payments } = useApp();
  const [status, setStatus] = useState(null);

  if (!currentMember) return null;
  const history = payments.filter((p) => p.memberId === currentMember.id);

  async function handlePay(option) {
    setStatus({ id: option.id, message: "Starting checkout..." });
    const result = await startCheckout({
      description: option.label,
      amount: option.amount,
    });
    setStatus({ id: option.id, message: result.message, ok: result.ok });
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
        <p className="mt-1 text-sm text-white/50">
          Submit dues and event fees via secure Stripe Checkout.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {DUE_OPTIONS.map((option) => (
            <div key={option.id} className="glass-panel rounded-xl p-5">
              <div className="flex items-center gap-2 text-ember">
                <CreditCard className="h-4.5 w-4.5" />
                <span className="text-xs font-bold uppercase tracking-wide">
                  {option.label}
                </span>
              </div>
              <p className="mt-3 font-display text-3xl">${option.amount}</p>
              <button
                type="button"
                onClick={() => handlePay(option)}
                className="btn-ember mt-4 w-full"
              >
                Pay now
              </button>
              {status?.id === option.id && (
                <p
                  className={`mt-2 text-xs ${status.ok === false ? "text-blood-light" : "text-white/50"}`}
                >
                  {status.message}
                </p>
              )}
            </div>
          ))}
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
                <tr
                  key={payment.id}
                  className="border-b border-line/60 last:border-0"
                >
                  <td className="py-3 text-white/70">{payment.date}</td>
                  <td className="py-3 text-white/70">{payment.type}</td>
                  <td className="py-3 font-semibold text-white">
                    ${payment.amount.toFixed(2)}
                  </td>
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
