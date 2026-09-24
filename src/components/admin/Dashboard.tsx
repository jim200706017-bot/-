import { useMemo, useState } from 'react'
import { Users, Hourglass, MessagesSquare, MousePointerClick, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useQa } from '@/lib/qa'
import {
  clearAnalytics,
  loadAnalytics,
  topClicks,
  totalClicks,
} from '@/lib/analytics'

const statusBadge: Record<string, string> = {
  approved: 'border-[#e8b84b]/50 text-[#e8b84b]',
  pending: 'border-[rgba(238,243,248,0.25)] text-[#9fb0c3]',
  rejected: 'border-red-400/40 text-red-400',
}
const statusLabel: Record<string, string> = {
  approved: '已审批',
  pending: '待审批',
  rejected: '已拒绝',
}

/** 数据看板：注册用户总览 + 话题点击排行 Top 10 */
export default function Dashboard() {
  const { users } = useAuth()
  const { questions } = useQa()
  const [analytics, setAnalytics] = useState(loadAnalytics)

  const approved = users.filter((u) => u.status === 'approved').length
  const pending = users.filter((u) => u.status === 'pending').length
  const clicks = totalClicks(analytics)
  const top = useMemo(() => topClicks(analytics, 10), [analytics])
  const maxCount = top[0]?.[1].count ?? 1

  const stats = [
    { icon: Users, label: '已审批用户', value: approved },
    { icon: Hourglass, label: '待审批', value: pending },
    { icon: MessagesSquare, label: '累计问答', value: questions.length },
    { icon: MousePointerClick, label: '内容总点击量', value: clicks },
  ]

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => b.createdAt - a.createdAt),
    [users],
  )

  return (
    <div>
      <h2 className="font-serif-sc mb-2 text-xl font-bold text-[#eef3f8]">数据看板</h2>
      <p className="mb-6 text-xs text-[#9fb0c3]">
        注册用户总览与主站内容点击排行（点击埋点仅统计已审批学生）。
      </p>

      {/* 统计卡 */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[rgba(238,243,248,0.1)] bg-[#0d1c33] p-5"
          >
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#e8b84b]/30 text-[#e8b84b]">
              <s.icon size={16} />
            </span>
            <p className="font-display text-3xl font-light text-[#eef3f8]">{s.value}</p>
            <p className="mt-1 text-xs text-[#9fb0c3]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 用户列表 */}
      <h3 className="mb-3 text-sm font-medium text-[#e8b84b]">注册用户（{users.length}）</h3>
      {sortedUsers.length === 0 ? (
        <p className="mb-10 rounded-xl border border-dashed border-[rgba(238,243,248,0.15)] p-6 text-center text-sm text-[#9fb0c3]">
          暂无注册用户
        </p>
      ) : (
        <div className="mb-10 overflow-x-auto rounded-xl border border-[rgba(238,243,248,0.1)]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[rgba(238,243,248,0.1)] bg-[#0d1c33] text-xs text-[#9fb0c3]">
                <th className="px-4 py-3 font-medium">姓名</th>
                <th className="px-4 py-3 font-medium">学号</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">注册时间</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((u) => (
                <tr
                  key={u.studentId}
                  className="border-b border-[rgba(238,243,248,0.06)] text-[#eef3f8]/90 last:border-0"
                >
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="font-display px-4 py-3 text-[#9fb0c3]">{u.studentId}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] ${statusBadge[u.status]}`}
                    >
                      {statusLabel[u.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#9fb0c3]">
                    {new Date(u.createdAt).toLocaleString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 话题点击排行 */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#e8b84b]">话题点击排行 Top 10</h3>
        <button
          onClick={() => {
            if (window.confirm('确定清空全部点击统计数据？')) {
              clearAnalytics()
              setAnalytics({})
            }
          }}
          className="flex items-center gap-1.5 text-xs text-red-400/80 transition-colors hover:text-red-400"
        >
          <Trash2 size={13} />
          清空统计
        </button>
      </div>
      {top.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[rgba(238,243,248,0.15)] p-6 text-center text-sm text-[#9fb0c3]">
          暂无点击数据（已审批学生点击主站内容卡片后产生）
        </p>
      ) : (
        <ul className="space-y-2.5">
          {top.map(([id, rec], i) => (
            <li key={id} className="flex items-center gap-3">
              <span className="font-display w-6 shrink-0 text-right text-sm italic text-[#e8b84b]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm text-[#eef3f8]">{rec.title}</span>
                  <span className="shrink-0 text-[11px] text-[#9fb0c3]">
                    {rec.section} · {rec.count} 次
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#0d1c33]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#e8b84b]/60 to-[#e8b84b] transition-all duration-700"
                    style={{ width: `${Math.max(4, (rec.count / maxCount) * 100)}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
