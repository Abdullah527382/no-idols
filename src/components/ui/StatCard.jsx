export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "ember",
}) {
  const accentClass =
    accent === "blood"
      ? "text-blood-light bg-blood/15"
      : accent === "brass"
        ? "text-brass bg-brass/15"
        : "text-ember bg-ember/15";

  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
            {label}
          </p>
          <p className="mt-2 text-3xl font-display">{value}</p>
          {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
        </div>
        {Icon && (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
