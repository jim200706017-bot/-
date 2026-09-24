import type { ReactNode } from 'react'
import Reveal from '@/components/Reveal'

interface SectionHeaderProps {
  num: string
  title: ReactNode
  note?: ReactNode
}

/** 板块头：大号衬线编号 + 标题 + 说明 */
export default function SectionHeader({ num, title, note }: SectionHeaderProps) {
  return (
    <Reveal className="mb-14 md:mb-20">
      <div className="flex items-baseline gap-5 md:gap-8">
        <span className="font-display text-5xl font-light italic text-[#e8b84b] md:text-7xl">
          {num}
        </span>
        <div>
          <h2 className="font-serif-sc text-3xl font-bold text-[#eef3f8] md:text-5xl">
            {title}
          </h2>
          {note && (
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-[#9fb0c3] md:text-sm">
              {note}
            </p>
          )}
        </div>
      </div>
      <div className="mt-8 h-px w-full bg-gradient-to-r from-[#e8b84b]/50 via-[rgba(238,243,248,0.12)] to-transparent" />
    </Reveal>
  )
}
