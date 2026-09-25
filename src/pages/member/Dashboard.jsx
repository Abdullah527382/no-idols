import { CalendarCheck, Flame, Target, TrendingUp } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { TierBadge } from "../../components/ui/Badge";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import GoalManager from "../../components/GoalManager";

export default function MemberDashboard() {
  const { currentMember } = useApp();

  if (!currentMember) return null;

  return (
    <div className="space-y-8">
      <section
        className="glass-panel relative overflow-hidden rounded-2xl bg-cover bg-center p-6"
        style={{ backgroundImage: "url('/posters/no-idols-season-fitness-session.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Welcome back</p>
            <h1 className="mt-1 font-display text-3xl">{currentMember.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <TierBadge tier={currentMember.tier} />
              <Badge status={currentMember.paymentStatus} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-white/40">Member since</p>
            <p className="font-display text-xl text-white/80">{currentMember.joined}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={CalendarCheck}
          label="Attendance rate"
          value={`${currentMember.attendanceRate}%`}
          sub={`${currentMember.sessionsAttended}/${currentMember.sessionsTotal} sessions`}
        />
        <StatCard
          icon={Target}
          label="Goal progress"
          value={`${currentMember.goalProgress}%`}
          sub="Across all tracked goals"
          accent="brass"
        />
        <StatCard
          icon={Flame}
          label="Payment status"
          value={currentMember.paymentStatus}
          sub="Per-session dues"
          accent={currentMember.paymentStatus === "Overdue" ? "blood" : "ember"}
        />
      </section>

      <section className="glass-panel rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4.5 w-4.5 text-ember" />
          <h2 className="font-display text-xl">Growth & Fitness Goals</h2>
        </div>
        <GoalManager />
      </section>
    </div>
  );
}
