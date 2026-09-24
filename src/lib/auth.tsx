import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { checkText, BLOCK_MESSAGE } from '@/lib/moderation'

/**
 * 认证 / 审批体系（纯前端演示版）。
 * 所有方法都是 async 签名，数据结构独立于此文件持久化，
 * 以后换真后端时只需把 localStorage 读写替换为 API 调用。
 */

/* ============================== 类型 ============================== */

export type Role = 'guest' | 'pending' | 'approved' | 'admin'
export type UserStatus = 'pending' | 'approved' | 'rejected'

export interface UserRecord {
  name: string
  studentId: string
  password: string // 演示版明文；正式版必须后端哈希
  status: UserStatus
  rejectReason?: string
  createdAt: number
}

export interface Session {
  studentId: string
  name: string
  role: Role
}

export interface RosterEntry {
  studentId: string
  name: string
  note?: string
}

/* ============================== 写死的管理员 ============================== */

export const ADMIN_ACCOUNT = {
  name: '李浩权',
  studentId: '25101601109',
  password: '123456',
} as const

/* ============================== 存储键与种子数据 ============================== */

const USERS_KEY = 'hmt-users-v1'
const ROSTER_KEY = 'hmt-roster-v1'
const SESSION_KEY = 'hmt-session-v1'

/** 港澳台生花名册初始数据（示例） */
const defaultRoster: RosterEntry[] = [
  { studentId: '25101601109', name: '李浩权', note: '管理员' },
  { studentId: '25101602220', name: '陈海晴', note: '示例' },
  { studentId: '25101603331', name: '林听涛', note: '示例' },
]

function loadUsers(): UserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (raw) return JSON.parse(raw) as UserRecord[]
  } catch {
    /* 损坏数据回退 */
  }
  return []
}

function loadRoster(): RosterEntry[] {
  try {
    const raw = localStorage.getItem(ROSTER_KEY)
    if (raw) return JSON.parse(raw) as RosterEntry[]
  } catch {
    /* 损坏数据回退 */
  }
  return defaultRoster
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw) as Session
  } catch {
    /* 损坏数据回退 */
  }
  return null
}

/* ============================== Context ============================== */

export interface RegisterResult {
  ok: boolean
  message: string
}

export interface LoginResult {
  ok: boolean
  message: string
  status?: UserStatus
}

interface AuthContextValue {
  session: Session | null
  role: Role
  users: UserRecord[]
  roster: RosterEntry[]
  register: (name: string, studentId: string, password: string) => Promise<RegisterResult>
  login: (studentId: string, password: string) => Promise<LoginResult>
  logout: () => void
  approveUser: (studentId: string) => Promise<void>
  rejectUser: (studentId: string, reason: string) => Promise<void>
  addRosterEntry: (entry: RosterEntry) => Promise<void>
  updateRosterEntry: (studentId: string, entry: Partial<RosterEntry>) => Promise<void>
  removeRosterEntry: (studentId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserRecord[]>(loadUsers)
  const [roster, setRoster] = useState<RosterEntry[]>(loadRoster)
  const [session, setSession] = useState<Session | null>(loadSession)

  const persistUsers = (next: UserRecord[]) => {
    setUsers(next)
    localStorage.setItem(USERS_KEY, JSON.stringify(next))
  }

  const persistRoster = (next: RosterEntry[]) => {
    setRoster(next)
    localStorage.setItem(ROSTER_KEY, JSON.stringify(next))
  }

  const register = useCallback(
    async (name: string, studentId: string, password: string): Promise<RegisterResult> => {
      const trimmedName = name.trim()
      const trimmedId = studentId.trim()
      if (!trimmedName || !trimmedId || !password) {
        return { ok: false, message: '请完整填写姓名、学号与密码' }
      }
      // 敏感词拦截：注册姓名
      if (checkText(trimmedName)) {
        return { ok: false, message: BLOCK_MESSAGE }
      }
      if (trimmedId === ADMIN_ACCOUNT.studentId) {
        return { ok: false, message: '该学号为管理员账号，请直接登录' }
      }
      // 进阶校验：学号 + 姓名必须与花名册匹配
      const inRoster = roster.find(
        (r) => r.studentId === trimmedId && r.name === trimmedName,
      )
      if (!inRoster) {
        return { ok: false, message: '学号与姓名不符，请联系管理员' }
      }
      if (users.some((u) => u.studentId === trimmedId)) {
        return { ok: false, message: '该学号已提交过注册，请直接登录' }
      }
      persistUsers([
        ...users,
        {
          name: trimmedName,
          studentId: trimmedId,
          password,
          status: 'pending',
          createdAt: Date.now(),
        },
      ])
      return { ok: true, message: '已提交，等待管理员审批' }
    },
    [users, roster],
  )

  const login = useCallback(
    async (studentId: string, password: string): Promise<LoginResult> => {
      const id = studentId.trim()
      // 管理员
      if (id === ADMIN_ACCOUNT.studentId) {
        if (password !== ADMIN_ACCOUNT.password) {
          return { ok: false, message: '账号或密码不正确' }
        }
        const s: Session = {
          studentId: id,
          name: ADMIN_ACCOUNT.name,
          role: 'admin',
        }
        setSession(s)
        localStorage.setItem(SESSION_KEY, JSON.stringify(s))
        return { ok: true, message: '欢迎回来，管理员' }
      }
      // 学生
      const user = users.find((u) => u.studentId === id)
      if (!user || user.password !== password) {
        return { ok: false, message: '账号或密码不正确' }
      }
      if (user.status === 'pending') {
        // 建立 pending 会话，主站显示「审批中」状态页
        const s: Session = { studentId: id, name: user.name, role: 'pending' }
        setSession(s)
        localStorage.setItem(SESSION_KEY, JSON.stringify(s))
        return { ok: true, status: 'pending', message: '你的注册申请正在审批中' }
      }
      if (user.status === 'rejected') {
        return {
          ok: false,
          status: 'rejected',
          message: `注册申请已被拒绝${user.rejectReason ? `：${user.rejectReason}` : '，请联系管理员'}`,
        }
      }
      const s: Session = { studentId: id, name: user.name, role: 'approved' }
      setSession(s)
      localStorage.setItem(SESSION_KEY, JSON.stringify(s))
      return { ok: true, message: `欢迎回来，${user.name}` }
    },
    [users],
  )

  const logout = useCallback(() => {
    setSession(null)
    localStorage.removeItem(SESSION_KEY)
  }, [])

  const approveUser = useCallback(
    async (studentId: string) => {
      persistUsers(
        users.map((u) =>
          u.studentId === studentId
            ? { ...u, status: 'approved' as const, rejectReason: undefined }
            : u,
        ),
      )
    },
    [users],
  )

  const rejectUser = useCallback(
    async (studentId: string, reason: string) => {
      persistUsers(
        users.map((u) =>
          u.studentId === studentId
            ? { ...u, status: 'rejected' as const, rejectReason: reason || undefined }
            : u,
        ),
      )
    },
    [users],
  )

  const addRosterEntry = useCallback(
    async (entry: RosterEntry) => {
      if (roster.some((r) => r.studentId === entry.studentId)) return
      persistRoster([...roster, entry])
    },
    [roster],
  )

  const updateRosterEntry = useCallback(
    async (studentId: string, patch: Partial<RosterEntry>) => {
      persistRoster(
        roster.map((r) => (r.studentId === studentId ? { ...r, ...patch } : r)),
      )
    },
    [roster],
  )

  const removeRosterEntry = useCallback(
    async (studentId: string) => {
      persistRoster(roster.filter((r) => r.studentId !== studentId))
    },
    [roster],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      role: session?.role ?? 'guest',
      users,
      roster,
      register,
      login,
      logout,
      approveUser,
      rejectUser,
      addRosterEntry,
      updateRosterEntry,
      removeRosterEntry,
    }),
    [
      session,
      users,
      roster,
      register,
      login,
      logout,
      approveUser,
      rejectUser,
      addRosterEntry,
      updateRosterEntry,
      removeRosterEntry,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
