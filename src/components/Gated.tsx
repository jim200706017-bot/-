import { useState, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth'
import Nav from '@/sections/Nav'
import Footer from '@/sections/Footer'
import Lock, { PendingState } from '@/components/Lock'
import AuthDialog from '@/components/AuthDialog'

/**
 * 门控页面骨架：Nav + 内容 + Footer。
 * 访客 → 锁定提示 + 登录/注册入口；待审批 → 审批中状态页；已审批/管理员 → 正常内容。
 */
export default function Gated({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')

  const openAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab)
    setAuthOpen(true)
  }

  const canView = role === 'approved' || role === 'admin'

  return (
    <div className="min-h-screen bg-[#0a1628] text-[#eef3f8]">
      <Nav />
      {canView ? (
        <main className="pt-16">{children}</main>
      ) : (
        <main>
          {role === 'pending' ? <PendingState /> : <Lock onOpenAuth={openAuth} />}
        </main>
      )}
      <Footer />
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} initialTab={authTab} />
    </div>
  )
}
