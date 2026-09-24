import { useState } from 'react'
import { Trash2, MessageSquareReply } from 'lucide-react'
import { useQa, type QaStatus } from '@/lib/qa'

type Filter = '全部' | QaStatus

/** 问答管理：筛选 / 撰写与修改回复 / 删除问题（违规处置兜底） */
export default function QaManager() {
  const { questions, answer, remove } = useQa()
  const [filter, setFilter] = useState<Filter>('全部')
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const list = questions.filter((q) => filter === '全部' || q.status === filter)

  return (
    <div>
      <h2 className="font-serif-sc mb-2 text-xl font-bold text-[#eef3f8]">问答管理</h2>
      <p className="mb-6 text-xs text-[#9fb0c3]">
        回复提交后学生端立即可见；违规内容可直接删除（敏感词拦截的兜底处置）。
      </p>

      {/* 筛选 */}
      <div className="mb-6 flex gap-2">
        {(['全部', '待回答', '已回答'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
              filter === f
                ? 'border-[#e8b84b] bg-[#e8b84b]/10 text-[#e8b84b]'
                : 'border-[rgba(238,243,248,0.15)] text-[#9fb0c3] hover:text-[#eef3f8]'
            }`}
          >
            {f}
            {f !== '全部' && `（${questions.filter((q) => q.status === f).length}）`}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[rgba(238,243,248,0.15)] p-8 text-center text-sm text-[#9fb0c3]">
          暂无{filter === '全部' ? '' : `「${filter}」`}问题
        </p>
      ) : (
        <ul className="space-y-4">
          {list.map((q) => (
            <li
              key={q.id}
              className="rounded-xl border border-[rgba(238,243,248,0.1)] bg-[#0d1c33] p-5"
            >
              <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-[#9fb0c3]">
                <span className="rounded-full bg-[#e8b84b]/10 px-2.5 py-0.5 text-[11px] text-[#e8b84b]">
                  {q.tag}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                    q.status === '已回答'
                      ? 'border-[#e8b84b]/50 text-[#e8b84b]'
                      : 'border-[rgba(238,243,248,0.25)]'
                  }`}
                >
                  {q.status}
                </span>
                <span>
                  {q.authorName}（{q.authorId}）· {new Date(q.createdAt).toLocaleString('zh-CN')}
                </span>
                <button
                  onClick={() => {
                    if (window.confirm(`确定删除问题「${q.title}」？`)) remove(q.id)
                  }}
                  className="ml-auto flex items-center gap-1 text-red-400/80 transition-colors hover:text-red-400"
                >
                  <Trash2 size={13} />
                  删除
                </button>
              </div>
              <h3 className="font-serif-sc mb-1.5 text-base font-semibold text-[#eef3f8]">
                {q.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-[#9fb0c3]">{q.detail}</p>

              <label>
                <span className="mb-1.5 flex items-center gap-1.5 text-[11px] tracking-wider text-[#9fb0c3]">
                  <MessageSquareReply size={12} />
                  {q.status === '已回答' ? '修改回复' : '撰写回复'}
                </span>
                <textarea
                  rows={3}
                  value={drafts[q.id] ?? q.answer ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                  placeholder="输入回复内容…"
                  className="w-full rounded-lg border border-[rgba(238,243,248,0.15)] bg-[#0a1628] px-3 py-2 text-sm text-[#eef3f8] outline-none transition-colors focus:border-[#e8b84b]"
                />
              </label>
              <button
                onClick={() => {
                  const text = (drafts[q.id] ?? q.answer ?? '').trim()
                  if (!text) return
                  answer(q.id, text)
                  setDrafts((d) => ({ ...d, [q.id]: '' }))
                }}
                className="mt-2 rounded-full border border-[#e8b84b] px-5 py-1.5 text-xs text-[#e8b84b] transition-colors hover:bg-[#e8b84b] hover:text-[#0a1628]"
              >
                提交回复
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
