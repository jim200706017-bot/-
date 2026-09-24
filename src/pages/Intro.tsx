import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Anchor,
  ArrowUp,
  ArrowDown,
  BookOpen,
  CalendarDays,
  Compass,
  GraduationCap,
  Layers,
  MessageCircleQuestion,
  UserRound,
} from 'lucide-react'

export const INTRO_SEEN_KEY = 'hmt-intro-seen-v1'

const SLIDE_COUNT = 3

const slideVariants = {
  enter: (dir: number) => ({ y: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

const contentStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } },
}
const contentItem = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
}

const overviewCards = [
  { icon: Layers, title: '校内信息平台汇聚', desc: '公众号 / 网站 / 系统，一站索引' },
  { icon: GraduationCap, title: '港澳台课程学位制度', desc: '毕业要求 · 能否保研' },
  { icon: BookOpen, title: '课程选择与学分 FAQ', desc: '来源标注 · 定期核实' },
  { icon: CalendarDays, title: '校内港澳台活动预告', desc: '见面会 · 实践 · 奖学金' },
  { icon: Compass, title: '学长姐经验总结', desc: '经验贴 · 文件附件' },
  { icon: UserRound, title: '校港澳台联络员', desc: '归口部门 · 咨询渠道' },
  { icon: MessageCircleQuestion, title: '问答互助', desc: '提问 · 管理员回复' },
]

/** 起始页滑动导览：3 页全屏 slide */
export default function Intro() {
  const navigate = useNavigate()
  const [[index, dir], setState] = useState<[number, number]>([0, 1])
  const lockRef = useRef(false)
  const touchStartX = useRef<number | null>(null)

  const go = useCallback((next: number) => {
    if (next < 0 || next >= SLIDE_COUNT) return
    setState(([prev]) => [next, next > prev ? 1 : -1])
  }, [])

  const step = useCallback(
    (delta: number) => {
      if (lockRef.current) return
      lockRef.current = true
      setTimeout(() => (lockRef.current = false), 700)
      setState(([prev]) => {
        const next = Math.min(SLIDE_COUNT - 1, Math.max(0, prev + delta))
        return next === prev ? [prev, 1] : [next, delta > 0 ? 1 : -1]
      })
    },
    [],
  )

  // 滚轮切换
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 24) return
      step(e.deltaY > 0 ? 1 : -1)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [step])

  // 键盘方向键（上下）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') step(1)
      if (e.key === 'ArrowUp' || e.key === 'PageUp') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  const enterSite = () => {
    localStorage.setItem(INTRO_SEEN_KEY, '1')
    navigate('/')
  }

  return (
    <div
      className="ocean-glow grain relative h-[100svh] overflow-hidden bg-[#0a1628] text-[#eef3f8]"
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientY)}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return
        const dy = e.changedTouches[0].clientY - touchStartX.current
        if (Math.abs(dy) > 48) step(dy < 0 ? 1 : -1)
        touchStartX.current = null
      }}
    >
      {/* 顶栏 */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 md:px-10">
        <span className="flex items-center gap-2.5">
          <span className="text-[#e8b84b]">
            <Anchor size={18} />
          </span>
          <span className="font-serif-sc text-sm font-semibold tracking-wider">
            华政港澳台学生咨询平台
          </span>
        </span>
        <button
          onClick={enterSite}
          className="link-sweep text-xs tracking-widest text-[#9fb0c3] transition-colors hover:text-[#eef3f8]"
        >
          跳过导览 →
        </button>
      </header>

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.main
          key={index}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center px-5 md:px-10"
        >
          {/* ============ Slide 1：品牌页 ============ */}
          {index === 0 && (
            <motion.div
              variants={contentStagger}
              initial="hidden"
              animate="visible"
              className="max-w-4xl"
            >
              <motion.p
                variants={contentItem}
                className="font-display mb-6 text-xs tracking-[0.35em] text-[#e8b84b] md:text-sm"
              >
                ECUPL · 港澳台学生资讯站
              </motion.p>
              <motion.h1
                variants={contentItem}
                className="font-serif-sc font-black leading-[1.1]"
              >
                <span className="block text-[clamp(2.6rem,9vw,7.5rem)]">华政港澳台</span>
                <span className="text-stroke-gold block text-[clamp(2.6rem,9vw,7.5rem)]">
                  学生咨询平台
                </span>
              </motion.h1>
              <motion.p
                variants={contentItem}
                className="mt-10 max-w-2xl text-sm leading-loose text-[#9fb0c3] md:text-base"
              >
                旨在帮助港澳台同学更好地了解华政港澳台的相关资讯，更好地适应华政港澳台的学习与工作。本平台汇聚信息、促进朋辈交流，不做任何有损国家利益的事情，坚持"一国两制"原则，坚定维护一个中国原则。
              </motion.p>
            </motion.div>
          )}

          {/* ============ Slide 2：平台内容概览 ============ */}
          {index === 1 && (
            <motion.div
              variants={contentStagger}
              initial="hidden"
              animate="visible"
              className="w-full max-w-5xl"
            >
              <motion.p
                variants={contentItem}
                className="font-display mb-3 text-xs tracking-[0.35em] text-[#e8b84b]"
              >
                WHAT'S INSIDE
              </motion.p>
              <motion.h2
                variants={contentItem}
                className="font-serif-sc mb-10 text-3xl font-bold md:text-5xl"
              >
                平台内容概览
              </motion.h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {overviewCards.map((c) => (
                  <motion.div
                    key={c.title}
                    variants={contentItem}
                    className="rounded-2xl border border-[rgba(238,243,248,0.1)] bg-[#10243e]/60 p-6"
                  >
                    <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#e8b84b]/30 text-[#e8b84b]">
                      <c.icon size={18} />
                    </span>
                    <h3 className="font-serif-sc mb-1.5 text-base font-semibold">{c.title}</h3>
                    <p className="text-xs text-[#9fb0c3]">{c.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ============ Slide 3：基本信息 + 进入平台 ============ */}
          {index === 2 && (
            <motion.div
              variants={contentStagger}
              initial="hidden"
              animate="visible"
              className="w-full max-w-3xl"
            >
              <motion.p
                variants={contentItem}
                className="font-display mb-3 text-xs tracking-[0.35em] text-[#e8b84b]"
              >
                BEFORE YOU BOARD
              </motion.p>
              <motion.h2
                variants={contentItem}
                className="font-serif-sc mb-10 text-3xl font-bold md:text-5xl"
              >
                基本信息
              </motion.h2>
              <motion.div
                variants={contentItem}
                className="space-y-5 rounded-2xl border border-[rgba(238,243,248,0.1)] bg-[#10243e]/60 p-7 text-sm leading-relaxed text-[#9fb0c3] md:p-9"
              >
                <p>
                  <span className="mr-3 text-[#e8b84b]">面向对象</span>
                  华东政法大学港澳台学生
                </p>
                <p>
                  <span className="mr-3 text-[#e8b84b]">归口部门</span>
                  国际交流处（港澳台办公室）· 长宁校区 · 021-62071695 · iec.ecupl.edu.cn
                </p>
                <p>
                  <span className="mr-3 text-[#e8b84b]">加入方式</span>
                  注册需填写姓名与学号（须与港澳台生花名册一致），提交后由管理员审批，审批通过即可查看全部内容。
                </p>
              </motion.div>
              <motion.div variants={contentItem} className="mt-12 flex items-center gap-6">
                <button
                  onClick={enterSite}
                  className="btn-gold px-10 py-3.5 text-sm font-medium tracking-[0.3em]"
                >
                  进入平台
                </button>
                <span className="text-xs text-[#9fb0c3]/70">已审批同学登录后查看全部板块</span>
              </motion.div>
            </motion.div>
          )}
        </motion.main>
      </AnimatePresence>

      {/* 上下箭头 */}
      <button
        aria-label="上一页"
        onClick={() => step(-1)}
        disabled={index === 0}
        className="absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-full border border-[rgba(238,243,248,0.15)] p-3 text-[#9fb0c3] transition-all hover:border-[#e8b84b] hover:text-[#e8b84b] disabled:opacity-20"
      >
        <ArrowUp size={18} />
      </button>
      <button
        aria-label="下一页"
        onClick={() => step(1)}
        disabled={index === SLIDE_COUNT - 1}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[rgba(238,243,248,0.15)] p-3 text-[#9fb0c3] transition-all hover:border-[#e8b84b] hover:text-[#e8b84b] disabled:opacity-20"
      >
        <ArrowDown size={18} />
      </button>

      {/* 圆点导航（右侧竖排） */}
      <div className="absolute right-5 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3 md:right-8">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            aria-label={`第 ${i + 1} 页`}
            onClick={() => go(i)}
            className={`w-2 rounded-full transition-all duration-500 ${
              i === index ? 'h-8 bg-[#e8b84b]' : 'h-2 bg-[#9fb0c3]/40 hover:bg-[#9fb0c3]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
