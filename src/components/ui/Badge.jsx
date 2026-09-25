import { Shield } from 'lucide-react'

const STYLES = {
  Paid: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  Pending: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  Overdue: 'bg-blood/20 text-blood-light ring-1 ring-blood/40',
  yes: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  no: 'bg-blood/20 text-blood-light ring-1 ring-blood/40',
  excused: 'bg-white/10 text-white/70 ring-1 ring-white/15',
}

export default function Badge({ status, children }) {
  return <span className={`badge ${STYLES[status] || 'bg-white/10 text-white/70 ring-1 ring-white/15'}`}>{children ?? status}</span>
}

export function TierBadge({ tier }) {
  return (
    <span className="badge bg-brass/15 text-brass ring-1 ring-brass/30">
      <Shield className="h-3 w-3" /> {tier}
    </span>
  )
}
