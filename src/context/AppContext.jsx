import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { syncWithSheets, callSheetsAction } from '../lib/sheets'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [role, setRole] = useState('member') // 'member' | 'admin'
  const [members, setMembers] = useState([])
  const [sessions, setSessions] = useState([])
  const [payments, setPayments] = useState([])
  const [goals, setGoals] = useState([])
  const [rsvps, setRsvps] = useState({}) // { [sessionId]: 'yes' | 'no' | 'excused' }
  const [lastSync, setLastSync] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const syncNow = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await syncWithSheets()
    setLastSync(result)

    if (result.ok && result.data) {
      setMembers(result.data.members || [])
      setSessions(result.data.sessions || [])
      setPayments(result.data.payments || [])
      setGoals(result.data.goals || [])
    } else if (!result.ok) {
      setError(result.message || 'Failed to sync with Google Sheets.')
    }

    setIsLoading(false)
    return result
  }, [])

  useEffect(() => {
    syncNow()
  }, [syncNow])

  const rsvp = useCallback((sessionId, status) => {
    setRsvps((prev) => ({ ...prev, [sessionId]: status }))
    const memberId = members[0]?.id
    if (memberId) callSheetsAction('rsvp', { memberId, sessionId, status })
  }, [members])

  const logCashPayment = useCallback(async ({ memberId, amount, type }) => {
    const member = members.find((m) => m.id === memberId)
    if (!member) return

    await callSheetsAction('logCashPayment', { memberId, amount, type })

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

  const logAttendance = useCallback(async ({ memberId }) => {
    await callSheetsAction('logAttendance', { memberId })

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

  const currentMember = members[0] || null

  const value = useMemo(
    () => ({
      role,
      setRole,
      members,
      sessions,
      payments,
      goals: currentMember ? goals.filter((g) => g.memberId === currentMember.id) : goals,
      rsvps,
      rsvp,
      logCashPayment,
      logAttendance,
      lastSync,
      syncNow,
      isLoading,
      error,
      currentMember,
    }),
    [role, members, sessions, payments, goals, rsvps, rsvp, logCashPayment, logAttendance, lastSync, syncNow, isLoading, error, currentMember],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
