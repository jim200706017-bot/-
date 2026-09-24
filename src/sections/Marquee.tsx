const items = [
  '课程选择与学分',
  'COURSE & CREDITS',
  '校内活动预告',
  'EVENTS & NOTICE',
  '学长姐经验',
  'PEER STORIES',
  '港澳台联络员',
  'CONTACT & SUPPORT',
]

/** 跑马灯滚动文字带 */
export default function Marquee() {
  const row = [...items, ...items]
  return (
    <div className="marquee-paused overflow-hidden border-y border-[rgba(238,243,248,0.08)] bg-[#0d1c33] py-5">
      <div className="animate-marquee flex w-max items-center">
        {row.map((text, i) => (
          <span key={i} className="flex items-center">
            <span
              className={`whitespace-nowrap px-8 text-lg md:text-2xl ${
                i % 2 === 0
                  ? 'font-serif-sc font-semibold text-[#eef3f8]/85'
                  : 'font-display italic text-[#e8b84b]/70'
              }`}
            >
              {text}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#e8b84b]/50" />
          </span>
        ))}
      </div>
    </div>
  )
}
