import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Anchor } from 'lucide-react'
import { useAuth } from '@/lib/auth'

interface AuthDialogProps {
  open: boolean
  onClose: () => void
  initialTab?: 'login' | 'register'
}

const inputCls =
  'w-full rounded-lg border border-[rgba(238,243,248,0.15)] bg-[#0a1628] px-4 py-2.5 text-sm text-[#eef3f8] outline-none transition-colors focus:border-[#e8b84b]'
const labelCls = 'mb-1.5 block text-xs tracking-widest text-[#9fb0c3]'

/** 登录 / 注册弹窗（注册需学号+姓名匹配花名册，提交后待审批） */
export default function AuthDialog({ open, onClose, initialTab = 'login' }: AuthDialogProps) {
  const { login, register } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>(initialTab)
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setName('')
    setStudentId('')
    setPassword('')
    setConfirm('')
    setMessage(null)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      if (tab === 'login') {
        const res = await login(studentId, password)
        if (res.ok) {
          reset()
          onClose()
        } else {
          setMessage({ ok: false, text: res.message })
        }
      } else {
        if (password !== confirm) {
          setMessage({ ok: false, text: '两次输入的密码不一致' })
          return
        }
        const res = await register(name, studentId, password)
        setMessage({ ok: res.ok, text: res.message })
        if (res.ok) {
          // 注册成功后切到登录页，便于审批通过后直接登录
          setTimeout(() => setTab('login'), 1200)
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[#050b14]/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-sm rounded-2xl border border-[rgba(238,243,248,0.12)] bg-[#10243e] p-8 shadow-2xl"
            initial={{ y: 32, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭"
              className="absolute right-4 top-4 text-[#9fb0c3] transition-colors hover:text-[#eef3f8]"
            >
              <X size={18} />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8b84b]/40 text-[#e8b84b]">
                <Anchor size={18} />
              </span>
              <div>
                <h2 className="font-serif-sc text-lg font-semibold text-[#eef3f8]">
                  {tab === 'login' ? '登录平台' : '注册账号'}
                </h2>
                <p className="text-xs text-[#9fb0c3]">
                  {tab === 'login' ? '学号 + 密码登录' : '注册需管理员审批后生效'}
                </p>
              </div>
            </div>

            {/* 选项卡 */}
            <div className="mb-6 grid grid-cols-2 rounded-full border border-[rgba(238,243,248,0.12)] p-1 text-sm">
              {(['login', 'register'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTab(t)
                    setMessage(null)
                  }}
                  className={`rounded-full py-1.5 transition-colors ${
                    tab === t ? 'bg-[#e8b84b] text-[#0a1628]' : 'text-[#9fb0c3] hover:text-[#eef3f8]'
                  }`}
                >
                  {t === 'login' ? '登录' : '注册'}
                </button>
              ))}
            </div>

            <form onSubmit={submit}>
              {tab === 'register' && (
                <label className="mb-4 block">
                  <span className={labelCls}>姓名</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                    placeholder="须与花名册一致"
                  />
                </label>
              )}
              <label className="mb-4 block">
                <span className={labelCls}>学号（作为账号）</span>
                <input
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  autoComplete="username"
                  className={inputCls}
                  placeholder="请输入学号"
                />
              </label>
              <label className="mb-4 block">
                <span className={labelCls}>密码</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  className={inputCls}
                  placeholder="请输入密码"
                />
              </label>
              {tab === 'register' && (
                <label className="mb-4 block">
                  <span className={labelCls}>确认密码</span>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className={inputCls}
                    placeholder="请再次输入密码"
                  />
                </label>
              )}

              {message && (
                <p className={`mb-3 text-xs leading-relaxed ${message.ok ? 'text-[#e8b84b]' : 'text-red-400'}`}>
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn-gold mt-2 w-full px-6 py-2.5 text-sm font-medium tracking-widest disabled:opacity-50"
              >
                {tab === 'login' ? '登 录' : '提交注册'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
