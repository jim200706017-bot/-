import { useRef } from 'react'
import { Link } from 'react-router'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Anchor } from 'lucide-react'
import Editable from '@/components/Editable'
import Reveal from '@/components/Reveal'

const friendLinks = [
  { label: '华政官网', href: 'https://www.ecupl.edu.cn' },
  { label: '教务处', href: 'https://jwc.ecupl.edu.cn' },
  { label: '国际交流处', href: 'https://iec.ecupl.edu.cn' },
  { label: '学信网', href: 'https://www.chsi.com.cn' },
]

/** 页脚：宗旨 + 免责声明 + 友情链接 + 巨型品牌字（滚动视差） */
export default function Footer() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  })
  // 巨型字随滚动轻微上浮视差
  const y = useTransform(scrollYProgress, [0, 1], [80, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.25, 1])

  return (
    <footer
      ref={ref}
      className="ocean-glow grain relative overflow-hidden border-t border-[rgba(238,243,248,0.08)]"
    >
      <div className="mx-auto max-w-6xl px-5 pt-20 md:px-8 md:pt-28">
        <div className="grid gap-12 pb-16 md:grid-cols-[1.4fr_1fr] md:gap-20">
          {/* 宗旨与免责 */}
          <Reveal>
            <div className="mb-6 flex items-center gap-2.5 text-[#e8b84b]">
              <Anchor size={20} />
              <span className="font-serif-sc text-sm font-semibold tracking-wider text-[#eef3f8]">
                华政港澳台学生咨询平台
              </span>
            </div>
            <p className="mb-6 max-w-md text-sm leading-loose text-[#9fb0c3]">
              <Editable path="footer.mission" multiline />
            </p>
            <p className="inline-block rounded-full border border-[rgba(238,243,248,0.15)] px-4 py-1.5 text-xs text-[#9fb0c3]">
              <Editable path="footer.disclaimer" />
            </p>
          </Reveal>

          {/* 友情链接 */}
          <Reveal delay={0.1}>
            <p className="font-display mb-6 text-xs tracking-[0.3em] text-[#e8b84b]">
              友情链接 · LINKS
            </p>
            <ul className="space-y-3.5">
              {friendLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="link-sweep text-sm text-[#eef3f8]/85 transition-colors hover:text-[#eef3f8]"
                  >
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      {/* 巨型品牌字：描边空心 + 滚动视差 */}
      <motion.div
        style={{ y, opacity }}
        aria-hidden
        className="pointer-events-none select-none px-2 pb-2 text-center"
      >
        <p className="text-stroke font-serif-sc whitespace-nowrap text-[clamp(3.4rem,14.5vw,13rem)] font-black leading-none tracking-tight">
          華政港澳台
        </p>
        <p className="font-display mt-2 text-[clamp(0.7rem,2vw,1.1rem)] font-light tracking-[0.6em] text-[#9fb0c3]/40">
          ECUPL · HMT · SINCE THE SEA
        </p>
      </motion.div>

      <div className="border-t border-[rgba(238,243,248,0.06)] py-5 text-center text-[11px] text-[#9fb0c3]/50">
        © 2026 华政港澳台学生咨询平台 · 学生自建资讯站（非官方网站） ·{' '}
        <Link to="/intro" className="link-sweep text-[#9fb0c3]/70 hover:text-[#e8b84b]">
          平台导览
        </Link>
      </div>
    </footer>
  )
}
