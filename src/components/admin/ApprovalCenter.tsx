import { useState } from 'react'
import { Check, X, Hourglass } from 'lucide-react'
import { useAuth } from '@/lib/auth'

/** 注册审批中心：待审批申请列表，通过 / 拒绝（可填原因） */
export default function ApprovalCenter() {
  const { users, approveUser, rejectUser } = useAuth()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const pending = users
    .filter((u) => u.status === 'pending')
    .sort((a, b) => b.createdAt - a.createdAt)
  const handled = users
    .filter((u) => u.status !== 'pending')
    .sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div>
      <h2 className="font-serif-sc mb-2 text-xl font-bold text-[#eef3f8]">注册审批</h2>
      <p className="mb-6 text-xs text-[#9fb0c3]">
        审批通过后，该学号 + 密码即可登录并查看全部板块内容。
      </p>

      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-[#e8b84b]">
        <Hourglass size={14} />
        待审批（{pending.length}）
      </h3>
      {pending.length === 0 ? (
        <p className="mb-8 rounded-xl border border-dashed border-[rgba(238,243,248,0.15)] p-6 text-center text-sm text-[#9fb0c3]">
          暂无待审批申请
        </p>
      ) : (
        <ul className="mb-8 space-y-2.5">
          {pending.map((u) => (
            <li
              key={u.studentId}
              className="rounded-xl border border-[#e8b84b]/25 bg-[#0d1c33] p-4"
            >
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <span className="font-serif-sc font-semibold text-[#eef3f8]">{u.name}</span>
                <span className="font-display text-[#9fb0c3]">{u.studentId}</span>
                <span className="text-[11px] text-[#9fb0c3]/70">
                  申请于 {new Date(u.createdAt).toLocaleString('zh-CN')}
                </span>
                <span className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => approveUser(u.studentId)}
                    className="flex items-center gap-1 rounded-full border border-[#e8b84b] px-4 py-1.5 text-xs text-[#e8b84b] transition-colors hover:bg-[#e8b84b] hover:text-[#0a1628]"
                  >
                    <Check size={13} />
                    通过
                  </button>
                  <button
                    onClick={() => {
                      setRejectingId(u.studentId)
                      setReason('')
                    }}
                    className="flex items-center gap-1 rounded-full border border-red-400/50 px-4 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-400/10"
                  >
                    <X size={13} />
                    拒绝
                  </button>
                </span>
              </div>
              {rejectingId === u.studentId && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="拒绝原因（可选）"
                    className="flex-1 rounded-lg border border-[rgba(238,243,248,0.15)] bg-[#0a1628] px-3 py-2 text-sm text-[#eef3f8] outline-none focus:border-red-400"
                  />
                  <button
                    onClick={() => {
                      rejectUser(u.studentId, reason.trim())
                      setRejectingId(null)
                    }}
                    className="rounded-full bg-red-400 px-4 py-2 text-xs font-medium text-[#0a1628]"
                  >
                    确认拒绝
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <h3 className="mb-3 text-sm font-medium text-[#9fb0c3]">已处理（{handled.length}）</h3>
      {handled.length === 0 ? (
        <p className="text-xs text-[#9fb0c3]/60">暂无记录</p>
      ) : (
        <ul className="space-y-2">
          {handled.map((u) => (
            <li
              key={u.studentId}
              className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border border-[rgba(238,243,248,0.08)] px-4 py-3 text-sm text-[#9fb0c3]"
            >
              <span className="text-[#eef3f8]">{u.name}</span>
              <span className="font-display">{u.studentId}</span>
              <span
                className={`ml-auto rounded-full border px-2.5 py-0.5 text-[11px] ${
                  u.status === 'approved'
                    ? 'border-[#e8b84b]/50 text-[#e8b84b]'
                    : 'border-red-400/40 text-red-400'
                }`}
              >
                {u.status === 'approved' ? '已通过' : `已拒绝${u.rejectReason ? `：${u.rejectReason}` : ''}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
