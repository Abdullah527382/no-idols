import { Clock, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export default function PendingApproval() {
  const { logOut } = useAuth();
  const { profile } = useApp();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brass/15 text-brass ring-1 ring-brass/30">
        <Clock className="h-7 w-7" />
      </div>
      <h1 className="font-display text-3xl">Account Pending Approval</h1>
      <p className="max-w-md text-sm text-white/50">
        Thanks for joining, {profile?.name || "brother"}. An admin needs to
        approve your account before you can access the member portal. Check back
        soon or reach out to Harris Ahmed.
      </p>
      <button type="button" onClick={logOut} className="btn-ghost mt-2">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
