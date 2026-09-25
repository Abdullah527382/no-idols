import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

// Gates a route behind: signed in -> approved -> (optionally) admin role.
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { firebaseUser } = useAuth();
  const { profile } = useApp();

  if (!firebaseUser) return <Navigate to="/" replace />;
  if (!profile?.isApproved) return <Navigate to="/pending" replace />;
  if (requireAdmin && !profile.isAdmin)
    return <Navigate to="/member" replace />;

  return children;
}
