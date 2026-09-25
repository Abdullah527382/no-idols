import {
  CalendarDays,
  MapPin,
  Clock,
  Check,
  X,
  CircleSlash,
} from "lucide-react";

export default function PosterCard({ session, rsvpStatus, onRsvp }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-line bg-surface transition hover:border-ember/40">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-charcoal">
        <img
          src={session.poster}
          alt={session.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-display text-lg leading-tight text-white drop-shadow">
            {session.title}
          </p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="text-sm text-white/60">{session.description}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/50">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> {session.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {session.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {session.location}
          </span>
        </div>

        {onRsvp && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <RsvpButton
              active={rsvpStatus === "yes"}
              onClick={() => onRsvp(session.id, "yes")}
              icon={Check}
              label="Yes"
              activeClass="bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
            />
            <RsvpButton
              active={rsvpStatus === "no"}
              onClick={() => onRsvp(session.id, "no")}
              icon={X}
              label="No"
              activeClass="bg-blood/25 text-blood-light ring-1 ring-blood/40"
            />
            <RsvpButton
              active={rsvpStatus === "excused"}
              onClick={() => onRsvp(session.id, "excused")}
              icon={CircleSlash}
              label="Excused"
              activeClass="bg-white/15 text-white ring-1 ring-white/30"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function RsvpButton({ active, onClick, icon: Icon, label, activeClass }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold transition ${
        active ? activeClass : "bg-white/5 text-white/50 hover:bg-white/10"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
