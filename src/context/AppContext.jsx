import { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { syncWithSheets, callSheetsAction } from '../lib/sheets'
import { ADMIN_EMAILS } from '../lib/firebase'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { firebaseUser, authLoading } = useAuth()

  const [members, setMembers] = useState([])
  const [sessions, setSessions] = useState([])
  const [payments, setPayments] = useState([])
  const [goals, setGoals] = useState([])
  const [dependents, setDependents] = useState([])
  const [users, setUsers] = useState([])
  const [rsvps, setRsvps] = useState({}) // { [sessionId]: 'yes' | 'no' | 'excused' }
  const [lastSync, setLastSync] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const hasRegistered = useRef(false)

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
      setDependents(result.data.dependents || [])
      setUsers(result.data.users || [])
    } else if (!result.ok) {
      setError(result.message || 'Failed to sync with Google Sheets.')
    }

    setIsLoading(false)
    return result
  }, [])

  useEffect(() => {
    syncNow()
  }, [syncNow])

  const email = firebaseUser?.email || null
  const isWhitelistedAdmin = email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false
  const userRecord = email ? users.find((u) => u.email === email) : null

  const profile = useMemo(() => {
    if (!firebaseUser) return null

    const role = isWhitelistedAdmin ? 'admin' : userRecord?.role || 'member'
    const status = isWhitelistedAdmin ? 'Approved' : userRecord?.status || 'Pending'

    return {
      uid: firebaseUser.uid,
      email,
      name: firebaseUser.displayName || userRecord?.name || email,
      role,
      status,
      isAdmin: role === 'admin',
      isApproved: status === 'Approved',
    }
  }, [firebaseUser, isWhitelistedAdmin, userRecord, email])

  // Auto-register a Users row for anyone who signs in but has no record yet.
  useEffect(() => {
    if (authLoading || isLoading || !firebaseUser || hasRegistered.current) return
    if (userRecord) return

    hasRegistered.current = true
    callSheetsAction('upsertUser', {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email,
    })

    setUsers((prev) => [
      ...prev,
      {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email,
        role: isWhitelistedAdmin ? 'admin' : 'member',
        status: isWhitelistedAdmin ? 'Approved' : 'Pending',
        createdAt: new Date().toISOString(),
      },
    ])
  }, [authLoading, isLoading, firebaseUser, userRecord, isWhitelistedAdmin])

  useEffect(() => {
    hasRegistered.current = false
  }, [email])

  const currentMember = useMemo(
    () => (email ? members.find((m) => m.email === email) || null : null),
    [members, email],
  )

  const rsvp = useCallback(
    (sessionId, status) => {
      setRsvps((prev) => ({ ...prev, [sessionId]: status }))
      if (currentMember) callSheetsAction('rsvp', { memberId: currentMember.id, sessionId, status })
    },
    [currentMember],
  )

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

    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, paymentStatus: 'Paid' } : m)))
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

  // --- Goals -----------------------------------------------------------

  const addGoal = useCallback(async (goal) => {
    if (!email) return
    const tempId = `g-${Date.now()}`
    const newGoal = { id: tempId, memberEmail: email, notes: '', ...goal }
    setGoals((prev) => [...prev, newGoal])
    await callSheetsAction('upsertGoal', newGoal)
  }, [email])

  const updateGoal = useCallback(async (id, patch) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
    const goal = goals.find((g) => g.id === id)
    if (goal) await callSheetsAction('upsertGoal', { ...goal, ...patch, id })
  }, [goals])

  const deleteGoal = useCallback(async (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
    await callSheetsAction('deleteGoal', { id })
  }, [])

  // --- Dependents --------------------------------------------------------

  const addDependent = useCallback(async (dependent) => {
    if (!email) return
    const tempId = `d-${Date.now()}`
    const newDependent = { id: tempId, memberEmail: email, ...dependent }
    setDependents((prev) => [...prev, newDependent])
    await callSheetsAction('upsertDependent', newDependent)
  }, [email])

  const removeDependent = useCallback(async (id) => {
    setDependents((prev) => prev.filter((d) => d.id !== id))
    await callSheetsAction('deleteDependent', { id })
  }, [])

  // --- Admin: user approvals ---------------------------------------------

  const approveUser = useCallback(async (userEmail, role) => {
    setUsers((prev) => prev.map((u) => (u.email === userEmail ? { ...u, status: 'Approved', role: role || u.role } : u)))
    await callSheetsAction('approveUser', { email: userEmail, role })
  }, [])

  const rejectUser = useCallback(async (userEmail) => {
    setUsers((prev) => prev.map((u) => (u.email === userEmail ? { ...u, status: 'Rejected' } : u)))
    await callSheetsAction('rejectUser', { email: userEmail })
  }, [])

  const inviteUser = useCallback(async ({ name, email: inviteEmail, role }) => {
    const newUser = {
      uid: '',
      email: inviteEmail,
      name,
      role: role || 'member',
      status: 'Approved',
      createdAt: new Date().toISOString(),
    }
    setUsers((prev) => [...prev, newUser])
    await callSheetsAction('upsertUser', newUser)
  }, [])

  const value = useMemo(
    () => ({
      profile,
      members,
      sessions,
      payments,
      goals: email ? goals.filter((g) => g.memberEmail === email) : [],
      dependents: email ? dependents.filter((d) => d.memberEmail === email) : [],
      users,
      rsvps,
      rsvp,
      logCashPayment,
      logAttendance,
      addGoal,
      updateGoal,
      deleteGoal,
      addDependent,
      removeDependent,
      approveUser,
      rejectUser,
      inviteUser,
      lastSync,
      syncNow,
      isLoading,
      error,
      currentMember,
    }),
    [
      profile, members, sessions, payments, goals, dependents, users, rsvps, rsvp,
      logCashPayment, logAttendance, addGoal, updateGoal, deleteGoal, addDependent,
      removeDependent, approveUser, rejectUser, inviteUser, lastSync, syncNow,
      isLoading, error, currentMember, email,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
