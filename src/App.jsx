import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Login from './pages/Login'
import MemberPortal from './pages/MemberPortal'
import MemberDashboard from './pages/member/Dashboard'
import MemberPayments from './pages/member/Payments'
import MemberSessions from './pages/member/Sessions'
import AdminPortal from './pages/AdminPortal'
import AdminMembers from './pages/admin/Members'
import AdminPosters from './pages/admin/Posters'
import AdminSync from './pages/admin/Sync'

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/member" element={<MemberPortal />}>
          <Route index element={<MemberDashboard />} />
          <Route path="payments" element={<MemberPayments />} />
          <Route path="sessions" element={<MemberSessions />} />
        </Route>

        <Route path="/admin" element={<AdminPortal />}>
          <Route index element={<AdminMembers />} />
          <Route path="posters" element={<AdminPosters />} />
          <Route path="sync" element={<AdminSync />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  )
}

export default App
