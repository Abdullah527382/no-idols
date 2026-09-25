import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Flame, ArrowRight, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export default function Login() {
  const {
    firebaseUser,
    authLoading,
    authError,
    signInWithGoogle,
    signInWithGithub,
    signInWithMicrosoft,
    signInWithEmail,
    registerWithEmail,
    isFirebaseConfigured,
  } = useAuth();
  const { profile } = useApp();
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (firebaseUser && profile) {
    if (!profile.isApproved) return <Navigate to="/pending" replace />;
    return <Navigate to={profile.isAdmin ? "/admin" : "/member"} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    if (mode === "signup") {
      await registerWithEmail(email, password, name);
    } else {
      await signInWithEmail(email, password);
    }
    setSubmitting(false);
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

          <div className="glass-panel space-y-5 rounded-2xl p-6 shadow-2xl shadow-black/40">
            {!isFirebaseConfigured && (
              <p className="rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-400 ring-1 ring-amber-500/30">
                Firebase isn&apos;t configured yet. Set the VITE_FIREBASE_* env
                vars to enable sign-in.
              </p>
            )}

            <div className="space-y-2">
              <SsoButton
                onClick={signInWithGoogle}
                label="Continue with Google"
                mark={<GoogleMark />}
              />
              <SsoButton
                onClick={signInWithGithub}
                label="Continue with GitHub"
                mark={<GithubMark />}
              />
              <SsoButton
                onClick={signInWithMicrosoft}
                label="Continue with Microsoft"
                mark={<MicrosoftMark />}
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-white/30">
              <div className="h-px flex-1 bg-line" />
              or use email
              <div className="h-px flex-1 bg-line" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              )}
              <input
                type="email"
                required
                placeholder="you@brotherhood.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />

              {authError && (
                <p className="text-xs text-blood-light">{authError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-ember w-full"
              >
                <Mail className="h-4 w-4" />
                {mode === "signup" ? "Create account" : "Sign in"}{" "}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="w-full text-center text-xs text-white/40 hover:text-white/70"
            >
              {mode === "signup"
                ? "Already a member? Sign in"
                : "New here? Create an account"}
            </button>

            <p className="text-center text-xs text-white/30">
              New accounts require Admin approval before member features unlock.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SsoButton({ onClick, label, mark }) {
  return (
    <button type="button" onClick={onClick} className="btn-ghost w-full">
      {mark} {label}
    </button>
  );
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.33v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.11z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function GithubMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.77.12 3.06.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .3.21.66.8.55A10.53 10.53 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}
