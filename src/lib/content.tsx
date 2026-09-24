import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/lib/auth'
import { SEED_PDF_ID } from '@/lib/db'

/* ============================== 类型 ============================== */

export const FAQ_CATEGORIES = ['课程学分', '经验总结', '学位制度', '生活', '考试经验'] as const
export type FaqCategory = (typeof FAQ_CATEGORIES)[number]

export interface FaqItem {
  cat: FaqCategory
  q: string
  a: string
  source: string
  verified: string
  attachments: string[] // IndexedDB 文件 id
}

export interface EventItem {
  date: string
  title: string
  desc: string
  status: '报名中' | '预告' | '已结束'
}

export interface ContactItem {
  name: string
  role: string
  email: string
  time: string
}

export interface PlatformItem {
  name: string
  type: '公众号' | '网站' | '系统'
  desc: string
  link: string
}

export interface SiteContent {
  hero: {
    kicker: string
    titleA: string
    titleB: string
    mission: string
  }
  events: { heading: string; note: string; source: string; items: EventItem[] }
  platforms: { heading: string; note: string; items: PlatformItem[] }
  contact: {
    heading: string
    note: string
    dept: string
    phone: string
    site: string
    items: ContactItem[]
  }
  faq: { heading: string; note: string; items: FaqItem[] }
  footer: { mission: string; disclaimer: string }
}

/** 可增删条目的板块 */
export type CrudSection = 'events' | 'platforms' | 'contact' | 'faq'

/* ============================== 种子内容（含 V3 → V4 迁移映射） ============================== */

export const defaultContent: SiteContent = {
  hero: {
    kicker: 'ECUPL · 港澳台学生资讯站',
    titleA: '跨海而来',
    titleB: '灯下设渡',
    mission:
      '旨在帮助港澳台同学更好地了解华政港澳台的相关资讯，更好地适应华政港澳台的学习与工作。本平台汇聚信息、促进朋辈交流，不做任何有损国家利益的事情，坚持"一国两制"原则，坚定维护一个中国原则。',
  },
  events: {
    heading: '校内港澳台活动预告',
    note: '示例',
    source: '活动信息来源为国际交流处（港澳台办）iec.ecupl.edu.cn',
    items: [
      {
        date: '9 月',
        title: '港澳台新生见面会',
        desc: '迎新季的传统项目：认识同届港澳台同学，听学长姐讲第一学期的生存指南。',
        status: '已结束',
      },
      {
        date: '10-11 月',
        title: '国情教育实践活动',
        desc: '走出校园的参访与实践，完成国情类课程学分的重要一环。',
        status: '报名中',
      },
      {
        date: '10-12 月',
        title: '港澳台学生奖学金评审通知',
        desc: '教育部港澳台学生奖学金年度评审，留意港澳台办通知与材料截止时间。',
        status: '报名中',
      },
      {
        date: '12 月',
        title: '海峡两岸学生交流活动',
        desc: '与台湾高校来访学生的交流座谈，期末前的一次轻松相聚。',
        status: '预告',
      },
    ],
  },
  platforms: {
    heading: '校内信息平台汇聚',
    note: '待添加',
    items: [
      { name: '待添加', type: '公众号', desc: '待添加：平台简介与关注方式。', link: '待添加' },
      { name: '待添加', type: '网站', desc: '待添加：平台简介与入口链接。', link: '待添加' },
      { name: '待添加', type: '系统', desc: '待添加：系统用途与登录方式。', link: '待添加' },
    ],
  },
  contact: {
    heading: '联系方式及联络员',
    note: '联络员信息待公布，如有紧急事务请直接联系归口部门。',
    dept: '国际交流处（港澳台办公室）· 长宁校区',
    phone: '021-62071695',
    site: 'iec.ecupl.edu.cn',
    items: [
      { name: '待公布', role: '待公布', email: '待公布', time: '待公布' },
      { name: '待公布', role: '待公布', email: '待公布', time: '待公布' },
      { name: '待公布', role: '待公布', email: '待公布', time: '待公布' },
      { name: '待公布', role: '待公布', email: '待公布', time: '待公布' },
      { name: '待公布', role: '待公布', email: '待公布', time: '待公布' },
    ],
  },
  faq: {
    heading: '常见问题解答',
    note: '以下问答均标注来源与核实日期，如有变动以学校及官方部门最新通知为准。',
    items: [
      // —— 原 01 课程学分 FAQ → 课程学分类 ——
      {
        cat: '课程学分',
        q: '港澳台生可以免修思政课和军训吗？',
        a: '可以。按教育部规定（教港澳台〔2016〕96 号），思想政治理论课和军训学分可由国情类课程替代。',
        source: '教育部文件',
        verified: '2026-09',
        attachments: [],
      },
      {
        cat: '课程学分',
        q: '学费和住宿费与内地学生一样吗？',
        a: '一样，同校同专业同标准（参考：学费 6500 元/学年、住宿 1200 元/学年）。',
        source: '教育部规定',
        verified: '2026-09',
        attachments: [],
      },
      {
        cat: '课程学分',
        q: '在哪里选课、查成绩？',
        a: '教务系统 jwxt.ecupl.edu.cn，选课通知关注教务处 jwc.ecupl.edu.cn 及公众号"华政教务"。',
        source: '华政教务处',
        verified: '2026-09',
        attachments: [],
      },
      {
        cat: '课程学分',
        q: '学籍如何查询？',
        a: '学信网 chsi.com.cn，用港澳居民来往内地通行证/台胞证/居住证注册。',
        source: '学信网',
        verified: '2026-09',
        attachments: [],
      },
      // —— 原 03 经验贴 → 经验总结类 ——
      {
        cat: '经验总结',
        q: '《联考入学第一学期选课避坑指南》',
        a: '第一轮选课别贪多，先保住培养方案里的必修；国情类替代课程尽早认定，免得后面被动。',
        source: '港澳台联考 · 2023 级 · 法律学院',
        verified: '示例',
        attachments: [SEED_PDF_ID],
      },
      {
        cat: '经验总结',
        q: '《回乡证过期换领全流程实录》',
        a: '从预约到取证共 7 个工作日，在内地也可换领；附所需材料清单与出入境接待大厅路线。',
        source: '香港 DSE · 2022 级 · 经济法学院',
        verified: '示例',
        attachments: [],
      },
      {
        cat: '经验总结',
        q: '《从华政到律所：港澳台生实习时间线》',
        a: '大二暑假开始投简历不算早。律所对港澳台生的证件要求、实习证明与留用节奏，一篇讲清。',
        source: '澳门四校联考 · 2021 级 · 国际法学院',
        verified: '示例',
        attachments: [],
      },
      {
        cat: '经验总结',
        q: '《国情课替代学分申请经验》',
        a: '思政课与军训学分如何申请以国情类课程替代：申请表、认定流程与常见被退回的原因。',
        source: '台湾学测 · 2023 级 · 知识产权学院',
        verified: '示例',
        attachments: [],
      },
      // —— 原 06 学位制度 → 学位制度类 ——
      {
        cat: '学位制度',
        q: '毕业要求',
        a: '待添加：港澳台学生毕业所需学分结构、必修环节与学位授予条件。',
        source: '待添加',
        verified: '待添加',
        attachments: [],
      },
      {
        cat: '学位制度',
        q: '能否保研',
        a: '待添加：港澳台学生推荐免试攻读研究生的政策口径与往年情况。',
        source: '待添加',
        verified: '待添加',
        attachments: [],
      },
      // —— 新分类占位 ——
      {
        cat: '生活',
        q: '待添加',
        a: '待添加：住宿、医保、证件、银行卡等校园生活常见问题。',
        source: '待添加',
        verified: '待添加',
        attachments: [],
      },
      {
        cat: '考试经验',
        q: '待添加',
        a: '待添加：期末考试、法考、语言考试等备考经验。',
        source: '待添加',
        verified: '待添加',
        attachments: [],
      },
    ],
  },
  footer: {
    mission: '汇聚信息、促进朋辈交流，帮助港澳台同学更好地适应华政的学习与工作。',
    disclaimer: '本平台资讯以学校及官方部门最新通知为准',
  },
}

/** 各板块新增条目时的空白模板 */
const itemTemplates: Record<CrudSection, (cat?: FaqCategory) => unknown> = {
  events: () => ({ date: '待定', title: '新活动', desc: '待填写简介', status: '预告' }),
  platforms: () => ({ name: '新平台', type: '网站', desc: '待填写简介', link: '待填写' }),
  contact: () => ({ name: '待公布', role: '待公布', email: '待公布', time: '待公布' }),
  faq: (cat) => ({
    cat: cat ?? '课程学分',
    q: '新问题',
    a: '待填写答案',
    source: '待填写',
    verified: '待填写',
    attachments: [],
  }),
}

/* ============================== 工具：dot-path 读写 ============================== */

function getPath(obj: unknown, path: string): string {
  const val = path
    .split('.')
    .reduce<unknown>((acc, key) => (acc == null ? acc : (acc as Record<string, unknown>)[key]), obj)
  return typeof val === 'string' ? val : ''
}

function setPath<T>(obj: T, path: string, value: string): T {
  const keys = path.split('.')
  const clone = structuredClone(obj)
  let cur: Record<string, unknown> = clone as Record<string, unknown>
  for (let i = 0; i < keys.length - 1; i++) {
    cur = cur[keys[i]] as Record<string, unknown>
  }
  cur[keys[keys.length - 1]] = value
  return clone
}

/* ============================== Context ============================== */

const CONTENT_KEY = 'hmt-content-v4'

interface ContentContextValue {
  content: SiteContent
  get: (path: string) => string
  update: (path: string, value: string) => void
  addItem: (section: CrudSection, cat?: FaqCategory) => void
  removeItem: (section: CrudSection, index: number) => void
  attachFile: (index: number, fileId: string) => void
  detachFile: (index: number, fileId: string) => void
  resetContent: () => void
  isAdmin: boolean
}

const ContentContext = createContext<ContentContextValue | null>(null)

function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(CONTENT_KEY)
    if (raw) return JSON.parse(raw) as SiteContent
  } catch {
    /* 损坏数据回退默认 */
  }
  return defaultContent
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  const isAdmin = role === 'admin'
  const [content, setContent] = useState<SiteContent>(loadContent)

  const persist = useCallback((next: SiteContent) => {
    setContent(next)
    try {
      localStorage.setItem(CONTENT_KEY, JSON.stringify(next))
    } catch {
      /* 存储满等情况静默失败 */
    }
  }, [])

  const get = useCallback((path: string) => getPath(content, path), [content])

  const update = useCallback(
    (path: string, value: string) => {
      persist(setPath(content, path, value))
    },
    [content, persist],
  )

  const addItem = useCallback(
    (section: CrudSection, cat?: FaqCategory) => {
      const next = structuredClone(content)
      const items = next[section].items as unknown[]
      items.push(itemTemplates[section](cat))
      persist(next)
    },
    [content, persist],
  )

  const removeItem = useCallback(
    (section: CrudSection, index: number) => {
      const next = structuredClone(content)
      const items = next[section].items as unknown[]
      items.splice(index, 1)
      persist(next)
    },
    [content, persist],
  )

  const attachFile = useCallback(
    (index: number, fileId: string) => {
      const next = structuredClone(content)
      const item = next.faq.items[index]
      if (!item.attachments.includes(fileId)) item.attachments.push(fileId)
      persist(next)
    },
    [content, persist],
  )

  const detachFile = useCallback(
    (index: number, fileId: string) => {
      const next = structuredClone(content)
      const item = next.faq.items[index]
      item.attachments = item.attachments.filter((id) => id !== fileId)
      persist(next)
    },
    [content, persist],
  )

  const resetContent = useCallback(() => {
    localStorage.removeItem(CONTENT_KEY)
    setContent(defaultContent)
  }, [])

  const value = useMemo(
    () => ({
      content,
      get,
      update,
      addItem,
      removeItem,
      attachFile,
      detachFile,
      resetContent,
      isAdmin,
    }),
    [content, get, update, addItem, removeItem, attachFile, detachFile, resetContent, isAdmin],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}
