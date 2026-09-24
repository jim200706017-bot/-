import { Mail, Clock, Phone, Globe, UserRound } from 'lucide-react'
import { useContent } from '@/lib/content'
import Editable from '@/components/Editable'
import Reveal from '@/components/Reveal'
import Gated from '@/components/Gated'
import PageHeader from '@/components/PageHeader'

/** /contact 联系方式及联络员页：5 个联络员卡片 + 老师联系方式卡片 */
export default function ContactPage() {
  const { content } = useContent()

  return (
    <Gated>
      <PageHeader
        kicker="CONTACT & SUPPORT"
        title={<Editable path="contact.heading" />}
        note={<Editable path="contact.note" multiline />}
      />

      <div className="mx-auto max-w-6xl px-5 pb-28 md:px-8">
        {/* 联络员卡片 ×5 */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {content.contact.items.map((_, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <article className="h-full rounded-2xl border border-dashed border-[rgba(238,243,248,0.18)] bg-[#10243e]/50 p-7 transition-colors duration-500 hover:border-[#e8b84b]/40">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a1628] text-[#9fb0c3]">
                    <UserRound size={18} />
                  </span>
                  <div>
                    <p className="font-serif-sc text-base font-semibold text-[#eef3f8]">
                      <Editable path={`contact.items.${i}.name`} />
                    </p>
                    <p className="text-xs text-[#9fb0c3]">
                      <Editable path={`contact.items.${i}.role`} />
                    </p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-[#9fb0c3] md:text-sm">
                  <li className="flex items-center gap-2.5">
                    <Mail size={14} className="shrink-0 text-[#e8b84b]/70" />
                    <Editable path={`contact.items.${i}.email`} />
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Clock size={14} className="shrink-0 text-[#e8b84b]/70" />
                    咨询时间：<Editable path={`contact.items.${i}.time`} />
                  </li>
                </ul>
              </article>
            </Reveal>
          ))}

          {/* 老师联系方式卡片 */}
          <Reveal delay={0.4}>
            <article className="flex h-full flex-col justify-between rounded-2xl border border-[#e8b84b]/30 bg-[#e8b84b]/[0.05] p-7">
              <div>
                <p className="mb-1 text-xs tracking-widest text-[#9fb0c3]">归口部门 · 老师联系方式</p>
                <p className="font-serif-sc mb-5 text-lg font-semibold leading-snug text-[#eef3f8]">
                  <Editable path="contact.dept" multiline />
                </p>
              </div>
              <ul className="space-y-2.5 text-sm text-[#9fb0c3]">
                <li className="flex items-center gap-2.5">
                  <Phone size={14} className="shrink-0 text-[#e8b84b]" />
                  <Editable path="contact.phone" />
                </li>
                <li>
                  <a
                    href="https://iec.ecupl.edu.cn"
                    target="_blank"
                    rel="noreferrer"
                    className="link-sweep flex items-center gap-2.5 text-[#eef3f8]"
                  >
                    <Globe size={14} className="shrink-0 text-[#e8b84b]" />
                    <Editable path="contact.site" />
                  </a>
                </li>
              </ul>
            </article>
          </Reveal>
        </div>
      </div>
    </Gated>
  )
}
