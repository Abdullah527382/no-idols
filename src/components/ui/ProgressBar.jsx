export default function ProgressBar({ value, max = 100, accent = 'ember' }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const colorClass = accent === 'blood' ? 'bg-blood-light' : accent === 'brass' ? 'bg-brass' : 'bg-ember'

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full ${colorClass} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  )
}
