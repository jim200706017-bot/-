import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LogOut,
  Anchor,
  LayoutDashboard,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { FAQ_CATEGORIES } from '@/lib/content'
import AuthDialog from '@/components/AuthDialog'

/** FAQ 下拉子栏目：五个分类 + 栏目以外的问答互助 */
const faqSubItems = [
  ...FAQ_CATEGORIES.map((cat) => ({
    label: cat,
    to: `/faq?cat=${encodeURIComponent(cat)}`,
  })),
  { label: '问答互助', to: '/qa' },
]

const dropdownVariants = {
  hidden: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const, staggerChildren: 0.05 },
  },
}
const dropdownItemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function Nav() {
  const { session, role, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [faqOpen, setFaqOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileFaqOpen, setMobileFaqOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab)
    setAuthOpen(true)
    setMobileOpen(false)
  }

  const plainLinks = [
    { to: '/events', label: '活动预告' },
    { to: '/platforms', label: '平台汇聚' },
    { to: '/contact', label: '联系方式及联络员' },
  ]

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || mobileOpen
            ? 'border-b border-[rgba(238,243,248,0.08)] bg-[#0a1628]/90 backdrop-blur-md'
            : 'bg-transparent'
        }`}
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          {/* 品牌 logo 回首页 */}
          <Link to="/" className="group flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <span className="text-[#e8b84b] transition-transform duration-500 group-hover:rotate-12">
              <Anchor size={20} />
            </span>
            <span className="font-serif-sc text-sm font-semibold tracking-wider text-[#eef3f8] md:text-base">
              华政港澳台学生咨询平台
            </span>
          </Link>

          {/* 桌面栏目 */}
          <div className="hidden items-center gap-7 lg:flex">
            {plainLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="link-sweep text-sm text-[#9fb0c3] transition-colors hover:text-[#eef3f8]"
              >
                {l.label}
              </Link>
            ))}

            {/* 常见问题解答：悬停下拉 */}
            <div
              className="relative"
              onMouseEnter={() => setFaqOpen(true)}
              onMouseLeave={() => setFaqOpen(false)}
            >
              <Link
                to="/faq"
                className="link-sweep flex items-center gap-1 text-sm text-[#9fb0c3] transition-colors hover:text-[#eef3f8]"
              >
                常见问题解答
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${faqOpen ? 'rotate-180' : ''}`}
                />
              </Link>
              <AnimatePresence>
                {faqOpen && (
                  <motion.ul
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute left-1/2 top-full min-w-44 -translate-x-1/2 pt-3"
                  >
                    <div className="overflow-hidden rounded-xl border border-[rgba(238,243,248,0.12)] bg-[#10243e]/95 shadow-2xl backdrop-blur-md">
                      {faqSubItems.map((s) => (
                        <motion.li key={s.label} variants={dropdownItemVariants}>
                          <Link
                            to={s.to}
                            onClick={() => setFaqOpen(false)}
                            className="block px-5 py-2.5 text-sm text-[#9fb0c3] transition-colors hover:bg-[#e8b84b]/10 hover:text-[#e8b84b]"
                          >
                            {s.label}
                          </Link>
                        </motion.li>
                      ))}
                    </div>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 用户区 */}
          <div className="flex items-center gap-3 md:gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                {role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-1.5 rounded-full border border-[#e8b84b]/40 px-3 py-1 text-xs text-[#e8b84b] transition-colors hover:bg-[#e8b84b]/10"
                  >
                    <LayoutDashboard size={13} />
                    管理面板
                  </button>
                )}
                <span className="hidden text-xs text-[#9fb0c3] md:inline">
                  {session.name}
                  {role === 'admin' ? ' · 管理员' : role === 'approved' ? ' · 已审批' : ''}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-xs text-[#9fb0c3] transition-colors hover:text-[#eef3f8]"
                >
                  <LogOut size={14} />
                  退出
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => openAuth('register')}
                  className="hidden text-xs text-[#9fb0c3] transition-colors hover:text-[#eef3f8] sm:inline"
                >
                  注册
                </button>
                <button
                  onClick={() => openAuth('login')}
                  className="btn-gold px-5 py-1.5 text-xs font-medium tracking-widest"
                >
                  登录
                </button>
              </div>
            )}

            {/* 移动端汉堡 */}
            <button
              aria-label="菜单"
              onClick={() => setMobileOpen((v) => !v)}
              className="text-[#eef3f8] lg:hidden"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* 移动端菜单 */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-[rgba(238,243,248,0.08)] lg:hidden"
            >
              <ul className="space-y-1 px-5 py-4">
                {plainLinks.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-[#9fb0c3] transition-colors hover:bg-[#10243e] hover:text-[#eef3f8]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                {/* 可展开分组：常见问题解答 */}
                <li>
                  <button
                    onClick={() => setMobileFaqOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-[#9fb0c3] transition-colors hover:bg-[#10243e] hover:text-[#eef3f8]"
                  >
                    常见问题解答
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-300 ${mobileFaqOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileFaqOpen && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        {faqSubItems.map((s) => (
                          <li key={s.label}>
                            <Link
                              to={s.to}
                              onClick={() => setMobileOpen(false)}
                              className="block rounded-lg py-2 pl-8 pr-3 text-sm text-[#9fb0c3]/80 transition-colors hover:text-[#e8b84b]"
                            >
                              {s.label}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} initialTab={authTab} />
    </>
  )
}
