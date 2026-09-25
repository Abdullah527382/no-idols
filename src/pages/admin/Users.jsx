import { useState } from "react";
import {
  UserPlus,
  Check,
  X,
  ShieldCheck,
  Users as UsersIcon,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Badge from "../../components/ui/Badge";

export default function AdminUsers() {
  const { users, approveUser, rejectUser, inviteUser } = useApp();
  const [form, setForm] = useState({ name: "", email: "", role: "member" });
  const [toast, setToast] = useState(null);

  const pending = users.filter((u) => u.status === "Pending");

  async function handleInvite(e) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    await inviteUser(form);
    setToast(`${form.name} added and approved.`);
    setForm({ name: "", email: "", role: "member" });
  }

  async function handleApprove(email) {
    await approveUser(email);
    setToast(`${email} approved.`);
  }

  async function handleReject(email) {
    await rejectUser(email);
    setToast(`${email} rejected.`);
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-3xl">User Management</h1>
        <p className="mt-1 text-sm text-white/50">
          Pre-approve members or review sign-ups waiting for access.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="glass-panel rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-4.5 w-4.5 text-ember" />
            <h2 className="font-display text-xl">Add / Invite User</h2>
          </div>
          <form onSubmit={handleInvite} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-field"
            />
            <input
              type="email"
              required
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="input-field"
            />
            <select
              value={form.role}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, role: e.target.value }))
              }
              className="input-field"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="btn-ember w-full">
              Add &amp; approve
            </button>
          </form>
          {toast && <p className="mt-3 text-xs text-emerald-400">{toast}</p>}
        </section>

        <section className="glass-panel rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-ember" />
            <h2 className="font-display text-xl">Approve / Reject Queue</h2>
          </div>

          {pending.length === 0 && (
            <p className="text-sm text-white/40">
              No sign-ups waiting for approval.
            </p>
          )}

          <div className="space-y-3">
            {pending.map((user) => (
              <div
                key={user.email}
                className="flex items-center justify-between rounded-lg border border-line bg-charcoal px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-white/40">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(user.email)}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(user.email)}
                    className="inline-flex items-center gap-1 rounded-md bg-blood/20 px-2.5 py-1.5 text-xs font-semibold text-blood-light ring-1 ring-blood/40 hover:bg-blood/30"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="glass-panel rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <UsersIcon className="h-4.5 w-4.5 text-ember" />
          <h2 className="font-display text-xl">All Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-white/40">
                <th className="pb-3 font-semibold">Name</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.email}
                  className="border-b border-line/60 last:border-0"
                >
                  <td className="py-3 text-white">{user.name}</td>
                  <td className="py-3 text-white/60">{user.email}</td>
                  <td className="py-3 text-white/60 capitalize">{user.role}</td>
                  <td className="py-3">
                    <Badge
                      status={
                        user.status === "Approved"
                          ? "Paid"
                          : user.status === "Rejected"
                            ? "Overdue"
                            : "Pending"
                      }
                    >
                      {user.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-white/40">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
