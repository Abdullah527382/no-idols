import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { seedMembers, seedSessions, seedPayments, seedGoals, currentMember } from '../data/seed'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [role, setRole] = useState('member') // 'member' | 'admin'
  const [members, setMembers] = useState(seedMembers)
  const [sessions] = useState(seedSessions)
  const [payments, setPayments] = useState(seedPayments)
  const [goals] = useState(seedGoals)
  const [rsvps, setRsvps] = useState({}) // { [sessionId]: 'yes' | 'no' | 'excused' }
  const [lastSync, setLastSync] = useState(null)

  const rsvp = useCallback((sessionId, status) => {
    setRsvps((prev) => ({ ...prev, [sessionId]: status }))
  }, [])

  const logCashPayment = useCallback(({ memberId, amount, type }) => {
    const member = members.find((m) => m.id === memberId)
    if (!member) return

    setPayments((prev) => [
      {
        id: `p-${Date.now()}`,
        memberId,
        memberName: member.name,
        amount: Number(amount),
        type: type || 'Cash Payment',
        status: 'Paid',
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ])

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, paymentStatus: 'Paid' } : m)),
    )
  }, [members])

  const logAttendance = useCallback(({ memberId }) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              sessionsAttended: Math.min(m.sessionsAttended + 1, m.sessionsTotal),
              attendanceRate: Math.round(
                (Math.min(m.sessionsAttended + 1, m.sessionsTotal) / m.sessionsTotal) * 100,
              ),
            }
          : m,
      ),
    )
  }, [])

  const markSynced = useCallback((result) => {
    setLastSync(result)
  }, [])

  const value = useMemo(
    () => ({
      role,
      setRole,
      members,
      sessions,
      payments,
      goals,
      rsvps,
      rsvp,
      logCashPayment,
      logAttendance,
      lastSync,
      markSynced,
      currentMember: members.find((m) => m.id === currentMember.id) || members[0],
    }),
    [role, members, sessions, payments, goals, rsvps, rsvp, logCashPayment, logAttendance, lastSync, markSynced],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
