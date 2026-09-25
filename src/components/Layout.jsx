import { NavLink, useNavigate } from 'react-router-dom'
import { Flame, Users, ShieldCheck, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children, nav }) {
  const { profile } = useApp()
  const { logOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await logOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ember/15 text-ember">
              <Flame className="h-4.5 w-4.5" />
            </div>
            <span className="font-display text-lg tracking-widest">NO IDOLS</span>
          </div>

          {profile?.isAdmin && (
            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface p-1">
              <ViewButton to="/member" icon={Users} label="Member" />
              <ViewButton to="/admin" icon={ShieldCheck} label="Admin" />
            </div>
          )}

          <div className="flex items-center gap-3">
            {profile?.name && <span className="hidden text-xs text-white/40 sm:inline">{profile.name}</span>}
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white/70"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>

        {nav && (
          <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
            <nav className="flex gap-1 overflow-x-auto">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                      isActive ? 'bg-ember text-ink' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}

function ViewButton({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
          isActive ? 'bg-ember text-ink' : 'text-white/50 hover:text-white/80'
        }`
      }
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </NavLink>
  )
}
