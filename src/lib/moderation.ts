/**
 * 内容审核：敏感词拦截（纯前端演示版）。
 * 内置词库 + 管理员自定义词库（localStorage）合并生效。
 */

const CUSTOM_WORDS_KEY = 'hmt-blockwords-v1'

export const BLOCK_MESSAGE =
  '内容包含违规词汇，请修改后再提交。平台禁止辱骂及危害国家统一的言论'

/* ============================== 内置敏感词库 ============================== */

/** 辱骂类 */
export const INSULT_WORDS: string[] = [
  '傻逼',
  '脑残',
  '废物',
  '滚蛋',
  '白痴',
  '畜生',
  '蠢货',
  '人渣',
  '王八蛋',
  '狗东西',
  '贱人',
  '去死',
]

/** 危害国家统一 / 政治敏感类 */
export const SECESSION_WORDS: string[] = [
  '台独',
  '港独',
  '藏独',
  '疆独',
  '分裂国家',
  '两个中国',
  '一中一台',
  '中华民国万岁',
  '台湾独立',
  '香港独立',
  '一边一国',
  '台湾国',
  '光复香港',
  '时代革命',
]

export const BUILTIN_WORDS: string[] = [...INSULT_WORDS, ...SECESSION_WORDS]

/* ============================== 自定义词库（管理员维护） ============================== */

export function loadCustomWords(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_WORDS_KEY)
    if (raw) return JSON.parse(raw) as string[]
  } catch {
    /* 损坏数据回退 */
  }
  return []
}

export function saveCustomWords(words: string[]): void {
  localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(words))
}

/** 合并后的生效词库（内置 + 自定义，去重） */
export function effectiveWords(): string[] {
  return Array.from(new Set([...BUILTIN_WORDS, ...loadCustomWords()]))
}

/* ============================== 检测 ============================== */

/**
 * 检测文本是否命中敏感词。
 * 命中返回命中的词，未命中返回 null。
 */
export function checkText(text: string): string | null {
  if (!text) return null
  const normalized = text.toLowerCase().replace(/\s+/g, '')
  for (const word of effectiveWords()) {
    if (word && normalized.includes(word.toLowerCase())) return word
  }
  return null
}
