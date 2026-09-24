import { Lock as LockIcon, Hourglass, CircleX } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import Reveal from '@/components/Reveal'

interface LockProps {
  onOpenAuth: (tab: 'login' | 'register') => void
}

/** 未获授权时的锁定提示区（访客 / 无独立状态页时的兜底） */
export default function Lock({ onOpenAuth }: LockProps) {
  const { role } = useAuth()

  return (
    <section className="mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-40">
      <Reveal className="mx-auto max-w-xl text-center">
        <span className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[#e8b84b]/40 text-[#e8b84b]">
          <LockIcon size={26} />
        </span>
        <h2 className="font-serif-sc mb-4 text-2xl font-bold text-[#eef3f8] md:text-4xl">
          内容仅对已审批同学开放
        </h2>
        <p className="mb-10 text-sm leading-loose text-[#9fb0c3]">
          平台各板块（课程学分 FAQ、活动预告、经验总结、联络员、平台汇聚、学位制度）
          需要登录且通过管理员审批后方可查看{role === 'guest' ? '。' : '，当前账号尚无访问权限。'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <button
            onClick={() => onOpenAuth('login')}
            className="btn-gold px-8 py-3 text-sm font-medium tracking-widest"
          >
            登录
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            className="link-sweep text-sm tracking-wider text-[#eef3f8]"
          >
            注册账号 →
          </button>
        </div>
      </Reveal>
    </section>
  )
}

/** 待审批状态页 */
export function PendingState() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-40">
      <Reveal className="mx-auto max-w-xl text-center">
        <span className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[#e8b84b]/40 text-[#e8b84b]">
          <Hourglass size={26} />
        </span>
        <h2 className="font-serif-sc mb-4 text-2xl font-bold text-[#eef3f8] md:text-4xl">
          审批中
        </h2>
        <p className="text-sm leading-loose text-[#9fb0c3]">
          你的注册申请已提交，正在等待管理员审批。审批通过后重新登录即可查看全部内容。
        </p>
      </Reveal>
    </section>
  )
}

/** 被拒状态页 */
export function RejectedState({ reason }: { reason?: string }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-40">
      <Reveal className="mx-auto max-w-xl text-center">
        <span className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-red-400/40 text-red-400">
          <CircleX size={26} />
        </span>
        <h2 className="font-serif-sc mb-4 text-2xl font-bold text-[#eef3f8] md:text-4xl">
          注册申请未通过
        </h2>
        <p className="text-sm leading-loose text-[#9fb0c3]">
          {reason ? `拒绝原因：${reason}` : '如有疑问请联系管理员（国际交流处 · 港澳台办公室）。'}
        </p>
      </Reveal>
    </section>
  )
}
