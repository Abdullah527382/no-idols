import { Routes, Route, Navigate } from 'react-router-dom'
import { Flame, AlertTriangle } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider, useApp } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import PendingApproval from './pages/PendingApproval'
import MemberPortal from './pages/MemberPortal'
import MemberDashboard from './pages/member/Dashboard'
import MemberPayments from './pages/member/Payments'
import MemberSessions from './pages/member/Sessions'
import AdminPortal from './pages/AdminPortal'
import AdminMembers from './pages/admin/Members'
import AdminUsers from './pages/admin/Users'
import AdminSync from './pages/admin/Sync'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </AuthProvider>
  )
}

function AppRoutes() {
  const { authLoading } = useAuth()
  const { isLoading, error, members } = useApp()

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-white/60">
        <Flame className="h-8 w-8 animate-pulse text-ember" />
        <p className="text-sm">Loading brotherhood data...</p>
      </div>
    )
  }

  if (error && members.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center text-white/60">
        <AlertTriangle className="h-8 w-8 text-blood-light" />
        <p className="max-w-md text-sm">{error}</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/pending" element={<PendingApproval />} />

      <Route
        path="/member"
        element={
          <ProtectedRoute>
            <MemberPortal />
          </ProtectedRoute>
        }
      >
        <Route index element={<MemberDashboard />} />
        <Route path="payments" element={<MemberPayments />} />
        <Route path="sessions" element={<MemberSessions />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminPortal />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminMembers />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="sync" element={<AdminSync />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
