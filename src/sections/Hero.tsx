import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router'
import { ArrowDown } from 'lucide-react'
import Editable from '@/components/Editable'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.25 } },
}

const item = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export default function Hero() {
  const { scrollY } = useScroll()
  // 滚动时 hero 轻微视差下沉 + 淡出
  const y = useTransform(scrollY, [0, 600], [0, 120])
  const opacity = useTransform(scrollY, [0, 500], [1, 0.15])

  return (
    <section
      id="top"
      className="ocean-glow grain relative flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      {/* 竖排装饰 */}
      <motion.span
        className="vertical-rl font-serif-sc absolute right-5 top-28 hidden select-none text-xs text-[#9fb0c3]/50 md:right-10 lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1.2 }}
      >
        燈塔 · 航線 · 彼岸
      </motion.span>

      {/* 灯塔光点 */}
      <motion.span
        className="animate-beacon absolute left-[12%] top-[22%] hidden h-2 w-2 rounded-full bg-[#e8b84b] shadow-[0_0_32px_10px_rgba(232,184,75,0.35)] md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      />

      <motion.div
        style={{ y, opacity }}
        className="mx-auto w-full max-w-6xl px-5 pb-24 pt-32 md:px-8"
      >
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.p
            variants={item}
            className="font-display mb-6 text-xs tracking-[0.35em] text-[#e8b84b] md:text-sm"
          >
            <Editable path="hero.kicker" />
          </motion.p>

          <motion.h1
            variants={item}
            className="font-serif-sc font-black leading-[1.08] text-[#eef3f8]"
          >
            <span className="block text-[clamp(2.9rem,10vw,8.5rem)]">
              <Editable path="hero.titleA" />
            </span>
            <span className="block text-[clamp(2.9rem,10vw,8.5rem)]">
              <span className="text-stroke-gold">
                <Editable path="hero.titleB" />
              </span>
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-10 max-w-2xl text-sm leading-loose text-[#9fb0c3] md:text-base md:leading-loose"
          >
            <Editable path="hero.mission" multiline />
          </motion.p>

          <motion.div
            variants={item}
            className="mt-12 flex flex-wrap items-center gap-6"
          >
            <Link
              to="/faq"
              className="btn-gold px-8 py-3 text-sm font-medium tracking-widest"
            >
              开始了解
            </Link>
            <Link
              to="/contact"
              className="link-sweep text-sm tracking-wider text-[#eef3f8]"
            >
              联系联络员 →
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* 底部滚动提示 */}
      <motion.button
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        aria-label="向下滚动"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#9fb0c3]/60 transition-colors hover:text-[#e8b84b]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <motion.span
          className="block"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={18} />
        </motion.span>
      </motion.button>
    </section>
  )
}
