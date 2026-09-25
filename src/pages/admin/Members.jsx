import { useMemo, useState } from 'react'
import { MessageCircle, Search, Users, DollarSign, CalendarX, ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Badge, { TierBadge } from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import ProgressBar from '../../components/ui/ProgressBar'
import { buildWhatsAppNudge } from '../../lib/whatsapp'

const FILTERS = [
  { id: 'all', label: 'All members' },
  { id: 'unpaid', label: 'Unpaid dues' },
  { id: 'missed', label: 'Missed sessions' },
]

export default function AdminMembers() {
  const { members } = useApp()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return members
      .filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
      .filter((m) => {
        if (filter === 'unpaid') return m.paymentStatus !== 'Paid'
        if (filter === 'missed') return m.attendanceRate < 60
        return true
      })
  }, [members, filter, query])

  const unpaidCount = members.filter((m) => m.paymentStatus !== 'Paid').length
  const missedCount = members.filter((m) => m.attendanceRate < 60).length
  const avgGoal = Math.round(members.reduce((sum, m) => sum + m.goalProgress, 0) / members.length)

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-3xl">Member Directory</h1>
        <p className="mt-1 text-sm text-white/50">Financial overview, attendance, and goal tracking for Harris Ahmed.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Total members" value={members.length} />
        <StatCard icon={DollarSign} label="Unpaid / overdue" value={unpaidCount} accent="blood" />
        <StatCard icon={CalendarX} label="Missed sessions" value={missedCount} accent="brass" />
        <StatCard icon={ShieldCheck} label="Avg. goal progress" value={`${avgGoal}%`} />
      </section>

      <section className="glass-panel rounded-2xl p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  filter === f.id ? 'bg-ember text-ink' : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members..."
              className="input-field pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-white/40">
                <th className="pb-3 font-semibold">Member</th>
                <th className="pb-3 font-semibold">Contact</th>
                <th className="pb-3 font-semibold">Attendance</th>
                <th className="pb-3 font-semibold">Payment</th>
                <th className="pb-3 font-semibold">Goal progress</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id} className="border-b border-line/60 last:border-0">
                  <td className="py-3">
                    <p className="font-semibold text-white">{member.name}</p>
                    <TierBadge tier={member.tier} />
                  </td>
                  <td className="py-3 text-white/60">{member.phone}</td>
                  <td className="py-3">
                    <p className="mb-1 text-white/70">
                      {member.sessionsAttended}/{member.sessionsTotal} &middot; {member.attendanceRate}%
                    </p>
                    <ProgressBar value={member.attendanceRate} accent={member.attendanceRate < 60 ? 'blood' : 'ember'} />
                  </td>
                  <td className="py-3">
                    <Badge status={member.paymentStatus} />
                  </td>
                  <td className="py-3">
                    <div className="w-28">
                      <p className="mb-1 text-white/70">{member.goalProgress}%</p>
                      <ProgressBar value={member.goalProgress} accent="brass" />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <a
                      href={buildWhatsAppNudge(member)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30 transition hover:bg-emerald-500/25"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Nudge
                    </a>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-white/40">
                    No members match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
