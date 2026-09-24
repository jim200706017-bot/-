import { CalendarDays } from 'lucide-react'
import { useContent } from '@/lib/content'
import { useAuth } from '@/lib/auth'
import { trackClick } from '@/lib/analytics'
import Editable from '@/components/Editable'
import Reveal from '@/components/Reveal'
import Gated from '@/components/Gated'
import PageHeader from '@/components/PageHeader'

const statusStyle: Record<string, string> = {
  报名中: 'border-[#e8b84b]/60 bg-[#e8b84b]/10 text-[#e8b84b]',
  预告: 'border-[rgba(238,243,248,0.25)] text-[#9fb0c3]',
  已结束: 'border-[rgba(238,243,248,0.12)] text-[#9fb0c3]/50 line-through',
}

/** /events 活动预告页 */
export default function EventsPage() {
  const { content } = useContent()
  const { role } = useAuth()

  return (
    <Gated>
      <PageHeader
        kicker="EVENTS & NOTICE"
        title={
          <>
            <Editable path="events.heading" />
            <span className="ml-4 rounded border border-[#e8b84b]/40 px-2.5 py-1 align-middle text-sm font-normal text-[#e8b84b]">
              <Editable path="events.note" />
            </span>
          </>
        }
        note={<Editable path="events.source" multiline />}
      />

      <div className="mx-auto max-w-6xl px-5 pb-28 md:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {content.events.items.map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <article
                onClick={() => {
                  if (role === 'approved') trackClick(`events:${i}`, item.title, '活动预告')
                }}
                className="group flex h-full cursor-pointer flex-col rounded-2xl border border-[rgba(238,243,248,0.1)] bg-[#10243e]/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#e8b84b]/40 hover:bg-[#10243e]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-display flex items-center gap-1.5 text-sm italic text-[#e8b84b]">
                    <CalendarDays size={14} />
                    <Editable path={`events.items.${i}.date`} />
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] ${statusStyle[item.status] ?? statusStyle['预告']}`}
                  >
                    <Editable path={`events.items.${i}.status`} />
                  </span>
                </div>
                <h3 className="font-serif-sc mb-3 text-base font-semibold leading-snug text-[#eef3f8] md:text-lg">
                  <Editable path={`events.items.${i}.title`} multiline />
                </h3>
                <p className="text-xs leading-relaxed text-[#9fb0c3] md:text-sm">
                  <Editable path={`events.items.${i}.desc`} multiline />
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Gated>
  )
}
