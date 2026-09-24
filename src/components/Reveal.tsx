import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const variants: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  once?: boolean
}

/** 滚动进入视口时的淡入上移动画（克制、单次） */
export default function Reveal({
  children,
  className,
  delay = 0,
  once = true,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-80px' }}
      custom={delay}
    >
      {children}
    </motion.div>
  )
}
