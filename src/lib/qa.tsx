import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { checkText, BLOCK_MESSAGE } from '@/lib/moderation'

/**
 * 问答互助数据层（纯前端演示版，localStorage）。
 * async 签名 + 独立存储结构，便于以后换真后端。
 */

const QA_KEY = 'hmt-qa-v1'

export const QA_TAGS = ['选课学分', '活动', '证件', '生活', '实习就业', '其他'] as const
export type QaTag = (typeof QA_TAGS)[number]

export type QaStatus = '待回答' | '已回答'

export interface QaRecord {
  id: string
  title: string
  detail: string
  tag: QaTag
  authorName: string
  authorId: string
  createdAt: number
  status: QaStatus
  answer?: string
  answeredAt?: number
}

export interface AskResult {
  ok: boolean
  message: string
}

function loadQa(): QaRecord[] {
  try {
    const raw = localStorage.getItem(QA_KEY)
    if (raw) return JSON.parse(raw) as QaRecord[]
  } catch {
    /* 损坏数据回退 */
  }
  return []
}

interface QaContextValue {
  questions: QaRecord[]
  ask: (
    title: string,
    detail: string,
    tag: QaTag,
    authorName: string,
    authorId: string,
  ) => Promise<AskResult>
  answer: (id: string, answer: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

const QaContext = createContext<QaContextValue | null>(null)

export function QaProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<QaRecord[]>(loadQa)

  const persist = useCallback((next: QaRecord[]) => {
    setQuestions(next)
    try {
      localStorage.setItem(QA_KEY, JSON.stringify(next))
    } catch {
      /* 存储满静默失败 */
    }
  }, [])

  const ask = useCallback(
    async (
      title: string,
      detail: string,
      tag: QaTag,
      authorName: string,
      authorId: string,
    ): Promise<AskResult> => {
      const t = title.trim()
      const d = detail.trim()
      if (!t || !d) return { ok: false, message: '请完整填写标题与问题描述' }
      // 敏感词拦截：标题 + 描述
      if (checkText(`${t} ${d}`)) {
        return { ok: false, message: BLOCK_MESSAGE }
      }
      const record: QaRecord = {
        id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: t,
        detail: d,
        tag,
        authorName,
        authorId,
        createdAt: Date.now(),
        status: '待回答',
      }
      persist([record, ...questions])
      return { ok: true, message: '提问已提交，等待管理员回复' }
    },
    [questions, persist],
  )

  const answer = useCallback(
    async (id: string, answerText: string) => {
      persist(
        questions.map((q) =>
          q.id === id
            ? { ...q, answer: answerText, answeredAt: Date.now(), status: '已回答' as const }
            : q,
        ),
      )
    },
    [questions, persist],
  )

  const remove = useCallback(
    async (id: string) => {
      persist(questions.filter((q) => q.id !== id))
    },
    [questions, persist],
  )

  const value = useMemo(
    () => ({ questions, ask, answer, remove }),
    [questions, ask, answer, remove],
  )

  return <QaContext.Provider value={value}>{children}</QaContext.Provider>
}

export function useQa(): QaContextValue {
  const ctx = useContext(QaContext)
  if (!ctx) throw new Error('useQa must be used within QaProvider')
  return ctx
}
