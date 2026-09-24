import { useState } from 'react'
import { Plus, X, ShieldAlert, Flag } from 'lucide-react'
import {
  INSULT_WORDS,
  SECESSION_WORDS,
  loadCustomWords,
  saveCustomWords,
} from '@/lib/moderation'

/** 审核词库：查看内置词 + 管理自定义敏感词（localStorage 合并生效） */
export default function WordManager() {
  const [custom, setCustom] = useState<string[]>(loadCustomWords)
  const [newWord, setNewWord] = useState('')
  const [error, setError] = useState('')

  const persist = (next: string[]) => {
    setCustom(next)
    saveCustomWords(next)
  }

  const add = () => {
    setError('')
    const w = newWord.trim()
    if (!w) return
    if (INSULT_WORDS.includes(w) || SECESSION_WORDS.includes(w) || custom.includes(w)) {
      setError('该词已在词库中')
      return
    }
    persist([...custom, w])
    setNewWord('')
  }

  return (
    <div>
      <h2 className="font-serif-sc mb-2 text-xl font-bold text-[#eef3f8]">审核词库</h2>
      <p className="mb-6 text-xs text-[#9fb0c3]">
        学生提交问答与注册姓名时进行敏感词检测，命中即拦截；内置词库只读，自定义词可增删，两者合并生效。
      </p>

      {/* 自定义词 */}
      <h3 className="mb-3 text-sm font-medium text-[#e8b84b]">自定义词（{custom.length}）</h3>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="输入要添加的敏感词"
          className="rounded-lg border border-[rgba(238,243,248,0.15)] bg-[#0a1628] px-3 py-2 text-sm text-[#eef3f8] outline-none transition-colors focus:border-[#e8b84b]"
        />
        <button
          onClick={add}
          className="flex items-center gap-1.5 rounded-full border border-[#e8b84b] px-5 py-2 text-xs text-[#e8b84b] transition-colors hover:bg-[#e8b84b] hover:text-[#0a1628]"
        >
          <Plus size={13} />
          添加
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
      {custom.length === 0 ? (
        <p className="mb-8 text-xs text-[#9fb0c3]/60">暂无自定义词</p>
      ) : (
        <div className="mb-8 flex flex-wrap gap-2">
          {custom.map((w) => (
            <span
              key={w}
              className="flex items-center gap-1.5 rounded-full border border-[#e8b84b]/40 bg-[#e8b84b]/[0.06] px-3 py-1 text-xs text-[#eef3f8]"
            >
              {w}
              <button
                onClick={() => persist(custom.filter((x) => x !== w))}
                aria-label={`删除 ${w}`}
                className="text-red-400/70 hover:text-red-400"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 内置词库（只读） */}
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-[#9fb0c3]">
        <ShieldAlert size={14} />
        内置 · 辱骂类（{INSULT_WORDS.length}）
      </h3>
      <div className="mb-8 flex flex-wrap gap-2">
        {INSULT_WORDS.map((w) => (
          <span
            key={w}
            className="rounded-full border border-[rgba(238,243,248,0.12)] px-3 py-1 text-xs text-[#9fb0c3]"
          >
            {w}
          </span>
        ))}
      </div>

      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-[#9fb0c3]">
        <Flag size={14} />
        内置 · 危害国家统一 / 政治敏感类（{SECESSION_WORDS.length}）
      </h3>
      <div className="flex flex-wrap gap-2">
        {SECESSION_WORDS.map((w) => (
          <span
            key={w}
            className="rounded-full border border-[rgba(238,243,248,0.12)] px-3 py-1 text-xs text-[#9fb0c3]"
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  )
}
