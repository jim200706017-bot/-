import { Globe, MessagesSquare, MonitorCog, QrCode } from 'lucide-react'
import { useContent } from '@/lib/content'
import { useAuth } from '@/lib/auth'
import { trackClick } from '@/lib/analytics'
import Editable from '@/components/Editable'
import Reveal from '@/components/Reveal'
import Gated from '@/components/Gated'
import PageHeader from '@/components/PageHeader'

const typeIcon: Record<string, typeof Globe> = {
  公众号: MessagesSquare,
  网站: Globe,
  系统: MonitorCog,
}

/** /platforms 平台汇聚页 */
export default function PlatformsPage() {
  const { content } = useContent()
  const { role } = useAuth()

  return (
    <Gated>
      <PageHeader
        kicker="PLATFORMS & DIRECTORY"
        title={
          <>
            <Editable path="platforms.heading" />
            <span className="ml-4 rounded border border-[#e8b84b]/40 px-2.5 py-1 align-middle text-sm font-normal text-[#e8b84b]">
              <Editable path="platforms.note" />
            </span>
          </>
        }
      />

      <div className="mx-auto max-w-6xl px-5 pb-28 md:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {content.platforms.items.map((item, i) => {
            const Icon = typeIcon[item.type] ?? Globe
            return (
              <Reveal key={i} delay={i * 0.08}>
                <article
                  onClick={() => {
                    if (role === 'approved') trackClick(`platforms:${i}`, item.name, '平台汇聚')
                  }}
                  className="group flex h-full cursor-pointer flex-col rounded-2xl border border-[rgba(238,243,248,0.1)] bg-[#10243e]/60 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[#e8b84b]/40 hover:bg-[#10243e]"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8b84b]/30 text-[#e8b84b]">
                      <Icon size={18} />
                    </span>
                    <span className="rounded-full bg-[#e8b84b]/10 px-3 py-1 text-[11px] text-[#e8b84b]">
                      <Editable path={`platforms.items.${i}.type`} />
                    </span>
                  </div>
                  <h3 className="font-serif-sc mb-2.5 text-lg font-semibold text-[#eef3f8]">
                    <Editable path={`platforms.items.${i}.name`} />
                  </h3>
                  <p className="mb-5 flex-1 text-xs leading-relaxed text-[#9fb0c3] md:text-sm">
                    <Editable path={`platforms.items.${i}.desc`} multiline />
                  </p>
                  <div className="flex items-center gap-2 border-t border-[rgba(238,243,248,0.08)] pt-4 text-xs text-[#9fb0c3]/80">
                    <QrCode size={14} className="shrink-0 text-[#e8b84b]/70" />
                    <span className="truncate">
                      <Editable path={`platforms.items.${i}.link`} />
                    </span>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </Gated>
  )
}
