import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircleQuestion, Plus, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useQa, QA_TAGS, type QaTag } from '@/lib/qa'
import { trackClick } from '@/lib/analytics'
import Reveal from '@/components/Reveal'
import Gated from '@/components/Gated'
import PageHeader from '@/components/PageHeader'

const inputCls =
  'w-full rounded-lg border border-[rgba(238,243,248,0.15)] bg-[#0a1628] px-4 py-2.5 text-sm text-[#eef3f8] outline-none transition-colors focus:border-[#e8b84b]'

/** /qa 问答互助页（提问 / 标签 / 管理员回复 / 敏感词拦截） */
export default function QaPage() {
  const { session, role } = useAuth()
  const { questions, ask } = useQa()
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [tag, setTag] = useState<QaTag>('选课学分')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!session) return
    const res = await ask(title, detail, tag, session.name, session.studentId)
    setMessage({ ok: res.ok, text: res.message })
    if (res.ok) {
      setTitle('')
      setDetail('')
      setTag('选课学分')
      setTimeout(() => {
        setFormOpen(false)
        setMessage(null)
      }, 1200)
    }
  }

  return (
    <Gated>
      <PageHeader
        kicker="Q&A COMMUNITY"
        title="问答互助"
        note="提问需遵守平台规范，禁止辱骂及危害国家统一的言论；管理员会尽快回复。"
      />

      <div className="mx-auto max-w-4xl px-5 pb-28 md:px-8">
        {/* 我要提问 */}
        <Reveal className="mb-10">
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="btn-gold flex items-center gap-2 px-8 py-3 text-sm font-medium tracking-widest"
          >
            {formOpen ? <X size={15} /> : <Plus size={15} />}
            {formOpen ? '收起表单' : '我要提问'}
          </button>
        </Reveal>

        <AnimatePresence>
          {formOpen && (
            <motion.form
              onSubmit={submit}
              className="mb-12 overflow-hidden rounded-2xl border border-[#e8b84b]/25 bg-[#10243e]/60 p-7 md:p-9"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="grid gap-4">
                <label>
                  <span className="mb-1.5 block text-xs tracking-widest text-[#9fb0c3]">标题</span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputCls}
                    placeholder="一句话概括你的问题"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs tracking-widest text-[#9fb0c3]">问题描述</span>
                  <textarea
                    rows={4}
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    className={inputCls}
                    placeholder="补充背景与细节，方便管理员和同学理解"
                  />
                </label>
                <div>
                  <span className="mb-2 block text-xs tracking-widest text-[#9fb0c3]">标签</span>
                  <div className="flex flex-wrap gap-2">
                    {QA_TAGS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTag(t)}
                        className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                          tag === t
                            ? 'border-[#e8b84b] bg-[#e8b84b]/10 text-[#e8b84b]'
                            : 'border-[rgba(238,243,248,0.15)] text-[#9fb0c3] hover:text-[#eef3f8]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {message && (
                  <p className={`text-xs ${message.ok ? 'text-[#e8b84b]' : 'text-red-400'}`}>
                    {message.text}
                  </p>
                )}
                <button type="submit" className="btn-gold w-fit px-8 py-2.5 text-sm font-medium tracking-widest">
                  提交提问
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* 问答列表（时间倒序） */}
        {questions.length === 0 ? (
          <Reveal>
            <p className="rounded-2xl border border-dashed border-[rgba(238,243,248,0.15)] p-10 text-center text-sm text-[#9fb0c3]">
              还没有提问，来做第一个提问的人吧。
            </p>
          </Reveal>
        ) : (
          <div className="space-y-5">
            {questions.map((q, i) => (
              <Reveal key={q.id} delay={Math.min(i, 4) * 0.06}>
                <article
                  onClick={() => {
                    if (role === 'approved') trackClick(q.id, q.title, '问答互助')
                  }}
                  className="cursor-pointer rounded-2xl border border-[rgba(238,243,248,0.1)] bg-[#10243e]/60 p-7 transition-all duration-500 hover:-translate-y-0.5 hover:border-[#e8b84b]/40 md:p-8"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[#e8b84b]/10 px-3 py-1 text-[11px] text-[#e8b84b]">
                      {q.tag}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                        q.status === '已回答'
                          ? 'border-[#e8b84b]/60 bg-[#e8b84b]/10 text-[#e8b84b]'
                          : 'border-[rgba(238,243,248,0.25)] text-[#9fb0c3]'
                      }`}
                    >
                      {q.status}
                    </span>
                    <span className="ml-auto text-[11px] text-[#9fb0c3]/70">
                      {q.authorName} · {new Date(q.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <h3 className="font-serif-sc mb-2 flex items-start gap-2.5 text-lg font-semibold leading-snug text-[#eef3f8]">
                    <MessageCircleQuestion size={18} className="mt-1 shrink-0 text-[#e8b84b]/70" />
                    {q.title}
                  </h3>
                  <p className="mb-1 text-sm leading-loose text-[#9fb0c3]">{q.detail}</p>

                  {q.status === '已回答' && q.answer && (
                    <div className="mt-5 rounded-xl border border-[#e8b84b]/25 bg-[#e8b84b]/[0.05] p-5">
                      <p className="mb-2 text-[11px] tracking-widest text-[#e8b84b]">
                        管理员回复
                        {q.answeredAt
                          ? ` · ${new Date(q.answeredAt).toLocaleString('zh-CN')}`
                          : ''}
                      </p>
                      <p className="text-sm leading-loose text-[#eef3f8]/90">{q.answer}</p>
                    </div>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Gated>
  )
}
