import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Login() {
  const { setRole } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("member");
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setRole(selected);
    navigate(selected === "admin" ? "/admin" : "/member");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            "url('/posters/no-idols-season-session-man-doing-dua.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/85 to-ink" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-ember/15 text-ember ring-1 ring-ember/30">
              <Flame className="h-7 w-7" />
            </div>
            <h1 className="font-display text-4xl tracking-widest">NO IDOLS</h1>
            <p className="mt-2 text-sm text-white/50">
              Brotherhood revival &middot; member portal &amp; goal tracker
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-panel space-y-5 rounded-2xl p-6 shadow-2xl shadow-black/40"
          >
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-line bg-charcoal p-1">
              <RoleTile
                active={selected === "member"}
                onClick={() => setSelected("member")}
                icon={Users}
                title="Member"
                subtitle="Sessions & dues"
              />
              <RoleTile
                active={selected === "admin"}
                onClick={() => setSelected("admin")}
                icon={ShieldCheck}
                title="Admin"
                subtitle="Harris Ahmed · COO"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selected === "admin"
                      ? "harris@noidols.org"
                      : "you@brotherhood.org"
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
            </div>

            <button type="submit" className="btn-ember w-full">
              Enter portal <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-center text-xs text-white/30">
              This is a proof-of-concept login. No credentials are verified.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function RoleTile({ active, onClick, icon: Icon, title, subtitle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-md px-3 py-3 transition ${
        active ? "bg-ember text-ink" : "text-white/50 hover:text-white/80"
      }`}
    >
      <Icon className="h-4.5 w-4.5" />
      <span className="text-sm font-bold">{title}</span>
      <span
        className={`text-[10px] ${active ? "text-ink/70" : "text-white/40"}`}
      >
        {subtitle}
      </span>
    </button>
  );
}
