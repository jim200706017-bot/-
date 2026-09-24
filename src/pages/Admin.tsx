import { useState } from 'react'
import { Navigate, Link } from 'react-router'
import {
  ArrowLeft,
  LayoutDashboard,
  FileText,
  FolderOpen,
  UserCheck,
  UsersRound,
  MessagesSquare,
  ShieldAlert,
  Anchor,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import Dashboard from '@/components/admin/Dashboard'
import ContentManager from '@/components/admin/ContentManager'
import FileManager from '@/components/admin/FileManager'
import ApprovalCenter from '@/components/admin/ApprovalCenter'
import RosterManager from '@/components/admin/RosterManager'
import QaManager from '@/components/admin/QaManager'
import WordManager from '@/components/admin/WordManager'

type MenuKey = 'dashboard' | 'content' | 'files' | 'approval' | 'roster' | 'qa' | 'words'

const menu: { key: MenuKey; label: string; icon: typeof FileText }[] = [
  { key: 'dashboard', label: '数据看板', icon: LayoutDashboard },
  { key: 'content', label: '内容管理', icon: FileText },
  { key: 'files', label: '文件管理', icon: FolderOpen },
  { key: 'approval', label: '注册审批', icon: UserCheck },
  { key: 'roster', label: '花名册管理', icon: UsersRound },
  { key: 'qa', label: '问答管理', icon: MessagesSquare },
  { key: 'words', label: '审核词库', icon: ShieldAlert },
]

/** 管理面板：左侧菜单 + 右侧内容区（仅管理员可见） */
export default function Admin() {
  const { role, session } = useAuth()
  const [active, setActive] = useState<MenuKey>('dashboard')

  if (role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-[#0a1628] text-[#eef3f8]">
      {/* 顶栏 */}
      <header className="flex h-16 items-center justify-between border-b border-[rgba(238,243,248,0.08)] px-5 md:px-8">
        <span className="flex items-center gap-2.5">
          <span className="text-[#e8b84b]">
            <Anchor size={18} />
          </span>
          <span className="font-serif-sc text-sm font-semibold tracking-wider">
            管理面板 · 华政港澳台学生咨询平台
          </span>
        </span>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs text-[#9fb0c3] sm:inline">
            {session?.name} · 管理员
          </span>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-[#9fb0c3] transition-colors hover:text-[#eef3f8]"
          >
            <ArrowLeft size={14} />
            返回主站
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-5 py-10 md:px-8">
        {/* 左侧菜单 */}
        <aside className="w-40 shrink-0 md:w-48">
          <nav className="sticky top-10 space-y-1.5">
            {menu.map((m) => (
              <button
                key={m.key}
                onClick={() => setActive(m.key)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm transition-colors ${
                  active === m.key
                    ? 'bg-[#e8b84b]/10 text-[#e8b84b]'
                    : 'text-[#9fb0c3] hover:bg-[#10243e] hover:text-[#eef3f8]'
                }`}
              >
                <m.icon size={15} />
                {m.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 右侧内容区 */}
        <main className="min-w-0 flex-1 rounded-2xl border border-[rgba(238,243,248,0.08)] bg-[#10243e]/40 p-6 md:p-8">
          {active === 'dashboard' && <Dashboard />}
          {active === 'content' && <ContentManager />}
          {active === 'files' && <FileManager />}
          {active === 'approval' && <ApprovalCenter />}
          {active === 'roster' && <RosterManager />}
          {active === 'qa' && <QaManager />}
          {active === 'words' && <WordManager />}
        </main>
      </div>
    </div>
  )
}
