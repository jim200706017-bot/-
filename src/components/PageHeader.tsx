import type { ReactNode } from 'react'
import Reveal from '@/components/Reveal'

interface PageHeaderProps {
  kicker: string
  title: ReactNode
  note?: ReactNode
}

/** 子页面页头：英文 kicker + 大号衬线标题 + 说明 */
export default function PageHeader({ kicker, title, note }: PageHeaderProps) {
  return (
    <Reveal className="mx-auto max-w-6xl px-5 pb-14 pt-20 md:px-8 md:pb-20 md:pt-28">
      <p className="font-display mb-4 text-xs tracking-[0.35em] text-[#e8b84b] md:text-sm">
        {kicker}
      </p>
      <h1 className="font-serif-sc text-4xl font-black leading-tight text-[#eef3f8] md:text-6xl">
        {title}
      </h1>
      {note && (
        <p className="mt-5 max-w-2xl text-xs leading-relaxed text-[#9fb0c3] md:text-sm">
          {note}
        </p>
      )}
      <div className="mt-10 h-px w-full bg-gradient-to-r from-[#e8b84b]/50 via-[rgba(238,243,248,0.12)] to-transparent" />
    </Reveal>
  )
}
