import { useState } from "react";
import { Star, ImagePlus, CalendarDays, MapPin } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function AdminPosters() {
  const { sessions } = useApp();
  const [featured, setFeatured] = useState(() => new Set([sessions[0]?.id]));

  function toggleFeatured(id) {
    setFeatured((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Poster & Event Manager</h1>
          <p className="mt-1 text-sm text-white/50">
            Manage upcoming revival sessions and feature event posters.
          </p>
        </div>
        <button type="button" className="btn-ember">
          <ImagePlus className="h-4 w-4" /> Upload new poster
        </button>
      </section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="overflow-hidden rounded-xl border border-line bg-surface"
          >
            <div className="relative aspect-[3/4] w-full bg-charcoal">
              <img
                src={session.poster}
                alt={session.title}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => toggleFeatured(session.id)}
                className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition ${
                  featured.has(session.id)
                    ? "bg-ember text-ink"
                    : "bg-black/50 text-white/70 hover:text-white"
                }`}
                title="Toggle featured"
              >
                <Star
                  className="h-4 w-4"
                  fill={featured.has(session.id) ? "currentColor" : "none"}
                />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="font-display text-lg leading-tight text-white">
                  {session.title}
                </p>
              </div>
            </div>
            <div className="space-y-2 p-4 text-xs text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> {session.date} &middot;{" "}
                {session.time}
              </span>
              <br />
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {session.location}
              </span>
              {featured.has(session.id) && (
                <p className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-ember">
                  Featured on member gallery
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
