/**
 * 内容点击埋点（纯前端演示版）。
 * 已登录学生点击 01–06 板块内容卡片时累加计数，供管理看板展示排行。
 */

const ANALYTICS_KEY = 'hmt-analytics-v1'

export interface ClickRecord {
  title: string
  section: string
  count: number
}

export type AnalyticsData = Record<string, ClickRecord>

export function loadAnalytics(): AnalyticsData {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY)
    if (raw) return JSON.parse(raw) as AnalyticsData
  } catch {
    /* 损坏数据回退 */
  }
  return {}
}

/** 记录一次点击：itemId 用内容路径（如 faq.items.0），天然唯一 */
export function trackClick(itemId: string, title: string, section: string): void {
  const data = loadAnalytics()
  const prev = data[itemId]
  data[itemId] = {
    title: title || prev?.title || itemId,
    section,
    count: (prev?.count ?? 0) + 1,
  }
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data))
  } catch {
    /* 存储满静默失败 */
  }
}

export function clearAnalytics(): void {
  localStorage.removeItem(ANALYTICS_KEY)
}

export function totalClicks(data: AnalyticsData): number {
  return Object.values(data).reduce((sum, r) => sum + r.count, 0)
}

/** 点击数 Top N */
export function topClicks(data: AnalyticsData, n = 10): [string, ClickRecord][] {
  return Object.entries(data)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, n)
}
