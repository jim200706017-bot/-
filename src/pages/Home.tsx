import { useEffect } from 'react'
import { Navigate, Link } from 'react-router'
import {
  CalendarDays,
  Layers,
  UserRound,
  BookOpen,
  MessageCircleQuestion,
  Compass,
  ArrowUpRight,
} from 'lucide-react'
import { seedSampleFile } from '@/lib/db'
import { INTRO_SEEN_KEY } from '@/pages/Intro'
import Nav from '@/sections/Nav'
import Hero from '@/sections/Hero'
import Marquee from '@/sections/Marquee'
import Footer from '@/sections/Footer'
import Reveal from '@/components/Reveal'

const overviewCards = [
  {
    to: '/events',
    icon: CalendarDays,
    title: '活动预告',
    desc: '见面会 · 国情实践 · 奖学金评审',
  },
  {
    to: '/platforms',
    icon: Layers,
    title: '平台汇聚',
    desc: '公众号 / 网站 / 系统，一站索引',
  },
  {
    to: '/contact',
    icon: UserRound,
    title: '联系方式及联络员',
    desc: '联络员 · 归口部门咨询渠道',
  },
  {
    to: '/faq',
    icon: BookOpen,
    title: '常见问题解答',
    desc: '课程学分 · 经验总结 · 学位制度 · 生活 · 考试经验',
  },
  {
    to: '/qa',
    icon: MessageCircleQuestion,
    title: '问答互助',
    desc: '提问 · 标签 · 管理员回复',
  },
  {
    to: '/intro',
    icon: Compass,
    title: '平台导览',
    desc: '第一次来？三页看懂这个平台',
  },
]

/** / 首页：hero + 平台内容概览卡片 + 页脚（访客可见的简介页） */
export default function Home() {
  const introSeen = localStorage.getItem(INTRO_SEEN_KEY) === '1'

  // 首次启动写入示例 PDF 附件（幂等）
  useEffect(() => {
    seedSampleFile()
  }, [])

  // 新访客先看滑动导览
  if (!introSeen) return <Navigate to="/intro" replace />

  return (
    <div className="min-h-screen bg-[#0a1628] text-[#eef3f8]">
      <Nav />
      <main>
        <Hero />
        <Marquee />

        {/* 平台内容概览 */}
        <section className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
          <Reveal className="mb-14">
            <p className="font-display mb-4 text-xs tracking-[0.35em] text-[#e8b84b] md:text-sm">
              WHAT'S INSIDE
            </p>
            <h2 className="font-serif-sc text-3xl font-bold text-[#eef3f8] md:text-5xl">
              平台内容概览
            </h2>
            <p className="mt-4 max-w-xl text-xs leading-relaxed text-[#9fb0c3] md:text-sm">
              各板块内容需已审批登录后查看；点击卡片前往对应页面。
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {overviewCards.map((c, i) => (
              <Reveal key={c.to} delay={i * 0.07}>
                <Link
                  to={c.to}
                  className="group flex h-full flex-col rounded-2xl border border-[rgba(238,243,248,0.1)] bg-[#10243e]/60 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[#e8b84b]/40 hover:bg-[#10243e]"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8b84b]/30 text-[#e8b84b] transition-colors duration-500 group-hover:bg-[#e8b84b] group-hover:text-[#0a1628]">
                      <c.icon size={19} />
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-[#9fb0c3]/40 transition-all duration-500 group-hover:translate-x-1 group-hover:text-[#e8b84b]"
                    />
                  </div>
                  <h3 className="font-serif-sc mb-2 text-lg font-semibold text-[#eef3f8] md:text-xl">
                    {c.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#9fb0c3] md:text-sm">{c.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
