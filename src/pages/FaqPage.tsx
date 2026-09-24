import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { BookOpen } from 'lucide-react'
import { useContent, FAQ_CATEGORIES, type FaqCategory } from '@/lib/content'
import { useAuth } from '@/lib/auth'
import { trackClick } from '@/lib/analytics'
import Editable from '@/components/Editable'
import Reveal from '@/components/Reveal'
import Gated from '@/components/Gated'
import PageHeader from '@/components/PageHeader'
import Attachments from '@/components/Attachments'

/** /faq 常见问题解答页：按子栏目分类 tab 切换（支持 ?cat= 直达） */
export default function FaqPage() {
  const { content } = useContent()
  const { role } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const catParam = searchParams.get('cat')
  const activeCat: FaqCategory = (FAQ_CATEGORIES as readonly string[]).includes(catParam ?? '')
    ? (catParam as FaqCategory)
    : '课程学分'

  // 每个条目在原数组中的索引（编辑路径需要），按分类过滤
  const filtered = useMemo(
    () =>
      content.faq.items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.cat === activeCat),
    [content.faq.items, activeCat],
  )

  return (
    <Gated>
      <PageHeader
        kicker="FAQ & GUIDES"
        title={<Editable path="faq.heading" />}
        note={<Editable path="faq.note" multiline />}
      />

      <div className="mx-auto max-w-6xl px-5 pb-28 md:px-8">
        {/* 分类 tab */}
        <Reveal className="mb-12">
          <div className="flex flex-wrap gap-2.5">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchParams({ cat })}
                className={`rounded-full border px-5 py-2 text-sm transition-all duration-300 ${
                  activeCat === cat
                    ? 'border-[#e8b84b] bg-[#e8b84b]/10 text-[#e8b84b]'
                    : 'border-[rgba(238,243,248,0.15)] text-[#9fb0c3] hover:border-[#e8b84b]/40 hover:text-[#eef3f8]'
                }`}
              >
                {cat}
                <span className="ml-1.5 text-[11px] opacity-60">
                  {content.faq.items.filter((it) => it.cat === cat).length}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* 该分类下的条目 */}
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[rgba(238,243,248,0.15)] p-10 text-center text-sm text-[#9fb0c3]">
            「{activeCat}」分类暂无内容，待添加。
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 md:gap-6">
            {filtered.map(({ item, index }, i) => (
              <Reveal key={index} delay={i * 0.08}>
                <article
                  onClick={() => {
                    if (role === 'approved')
                      trackClick(`faq:${activeCat}:${i}`, item.q, `FAQ·${activeCat}`)
                  }}
                  className="group h-full cursor-pointer rounded-2xl border border-[rgba(238,243,248,0.1)] bg-[#10243e]/60 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[#e8b84b]/40 hover:bg-[#10243e] md:p-9"
                >
                  <div className="mb-5 flex items-start gap-4">
                    <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e8b84b]/30 text-[#e8b84b] transition-colors duration-500 group-hover:bg-[#e8b84b] group-hover:text-[#0a1628]">
                      <BookOpen size={16} />
                    </span>
                    <h3 className="font-serif-sc text-lg font-semibold leading-snug text-[#eef3f8] md:text-xl">
                      <Editable path={`faq.items.${index}.q`} multiline />
                    </h3>
                  </div>
                  <p className="mb-6 text-sm leading-loose text-[#9fb0c3]">
                    <Editable path={`faq.items.${index}.a`} multiline />
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-[rgba(238,243,248,0.08)] pt-4 text-xs text-[#9fb0c3]/80">
                    <span>
                      来源：<Editable path={`faq.items.${index}.source`} />
                    </span>
                    <span>
                      核实：<Editable path={`faq.items.${index}.verified`} />
                    </span>
                  </div>
                  <Attachments ids={item.attachments} />
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Gated>
  )
}
