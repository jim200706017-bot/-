import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const inputCls =
  'rounded-lg border border-[rgba(238,243,248,0.15)] bg-[#0a1628] px-3 py-2 text-sm text-[#eef3f8] outline-none transition-colors focus:border-[#e8b84b]'

/** 花名册管理：注册校验所用的 学号→姓名 数据，可增删改 */
export default function RosterManager() {
  const { roster, addRosterEntry, updateRosterEntry, removeRosterEntry } = useAuth()
  const [newId, setNewId] = useState('')
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')

  const add = async () => {
    setError('')
    const id = newId.trim()
    const name = newName.trim()
    if (!id || !name) {
      setError('请填写学号与姓名')
      return
    }
    if (roster.some((r) => r.studentId === id)) {
      setError('该学号已存在于花名册')
      return
    }
    await addRosterEntry({ studentId: id, name, note: '管理员添加' })
    setNewId('')
    setNewName('')
  }

  return (
    <div>
      <h2 className="font-serif-sc mb-2 text-xl font-bold text-[#eef3f8]">花名册管理</h2>
      <p className="mb-6 text-xs text-[#9fb0c3]">
        注册时校验「学号 + 姓名」必须与花名册完全一致，否则拒绝注册。
      </p>

      {/* 新增 */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          placeholder="学号"
          className={inputCls}
        />
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="姓名"
          className={inputCls}
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

      {/* 列表 */}
      <ul className="space-y-2">
        {roster.map((r) => (
          <li
            key={r.studentId}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-[rgba(238,243,248,0.1)] bg-[#0d1c33] px-4 py-3"
          >
            <span className="font-display w-32 text-sm text-[#9fb0c3]">{r.studentId}</span>
            <input
              value={r.name}
              onChange={(e) => updateRosterEntry(r.studentId, { name: e.target.value })}
              className={`${inputCls} w-32`}
            />
            {r.note && (
              <span className="rounded-full bg-[#e8b84b]/10 px-2.5 py-0.5 text-[11px] text-[#e8b84b]">
                {r.note}
              </span>
            )}
            <button
              onClick={() => {
                if (window.confirm(`确定从花名册删除 ${r.name}（${r.studentId}）？`)) {
                  removeRosterEntry(r.studentId)
                }
              }}
              aria-label="删除"
              className="ml-auto text-red-400/70 transition-colors hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
