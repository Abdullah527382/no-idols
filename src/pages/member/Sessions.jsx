import { useApp } from '../../context/AppContext'
import PosterCard from '../../components/PosterCard'

export default function MemberSessions() {
  const { sessions, rsvps, rsvp } = useApp()

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-3xl">Sessions &amp; Event Posters</h1>
        <p className="mt-1 text-sm text-white/50">RSVP to upcoming revival sessions and track what's next.</p>
      </section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <PosterCard key={session.id} session={session} rsvpStatus={rsvps[session.id]} onRsvp={rsvp} />
        ))}
      </div>
    </div>
  )
}
