import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Paperclip, X } from 'lucide-react'
import {
  useContent,
  FAQ_CATEGORIES,
  type CrudSection,
  type FaqCategory,
} from '@/lib/content'
import { putFile, getAllFiles, type FileMeta } from '@/lib/db'

const sections: {
  key: CrudSection
  label: string
  fields: { key: string; label: string; multiline?: boolean }[]
}[] = [
  {
    key: 'events',
    label: '活动预告',
    fields: [
      { key: 'date', label: '日期标签' },
      { key: 'title', label: '标题' },
      { key: 'desc', label: '简介', multiline: true },
      { key: 'status', label: '状态（报名中/预告/已结束）' },
    ],
  },
  {
    key: 'platforms',
    label: '平台汇聚',
    fields: [
      { key: 'name', label: '平台名称' },
      { key: 'type', label: '类型（公众号/网站/系统）' },
      { key: 'desc', label: '简介', multiline: true },
      { key: 'link', label: '链接/二维码说明' },
    ],
  },
  {
    key: 'contact',
    label: '联络员',
    fields: [
      { key: 'name', label: '姓名' },
      { key: 'role', label: '职务' },
      { key: 'email', label: '邮箱' },
      { key: 'time', label: '咨询时间' },
    ],
  },
  {
    key: 'faq',
    label: '常见问题解答',
    fields: [
      { key: 'q', label: '问题 / 标题' },
      { key: 'a', label: '答案 / 内容', multiline: true },
      { key: 'source', label: '来源 / 作者标签' },
      { key: 'verified', label: '核实日期' },
    ],
  },
]

const inputCls =
  'w-full rounded-lg border border-[rgba(238,243,248,0.15)] bg-[#0a1628] px-3 py-2 text-sm text-[#eef3f8] outline-none transition-colors focus:border-[#e8b84b]'

/** 内容管理：活动 / 平台 / 联络员（含老师联系方式）/ 分类 FAQ 的完整 CRUD + FAQ 附件 */
export default function ContentManager() {
  const { content, get, update, addItem, removeItem, attachFile, detachFile } = useContent()
  const [tab, setTab] = useState<CrudSection>('events')
  const [newCat, setNewCat] = useState<FaqCategory>('课程学分')
  const [files, setFiles] = useState<FileMeta[]>([])
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const attachIndexRef = useRef<number | null>(null)

  const refreshFiles = () => getAllFiles().then(setFiles)
  useEffect(() => {
    refreshFiles()
  }, [])

  const active = sections.find((s) => s.key === tab)!
  const items = content[tab].items as unknown[]

  const onPickFile = async (file: File | undefined) => {
    setUploadError('')
    const index = attachIndexRef.current
    if (!file || index == null) return
    try {
      const meta = await putFile(file, file.name)
      attachFile(index, meta.id)
      await refreshFiles()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : '上传失败')
    }
  }

  return (
    <div>
      <h2 className="font-serif-sc mb-2 text-xl font-bold text-[#eef3f8]">内容管理</h2>
      <p className="mb-6 text-xs text-[#9fb0c3]">
        对各页面条目进行新增 / 编辑 / 删除；页面上的行内文字编辑（contentEditable）仍然可用。
      </p>

      {/* 板块选项卡 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setTab(s.key)}
            className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
              tab === s.key
                ? 'border-[#e8b84b] bg-[#e8b84b]/10 text-[#e8b84b]'
                : 'border-[rgba(238,243,248,0.15)] text-[#9fb0c3] hover:text-[#eef3f8]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 联络员页签：老师联系方式（归口部门）编辑 */}
      {tab === 'contact' && (
        <div className="mb-6 rounded-xl border border-[#e8b84b]/25 bg-[#e8b84b]/[0.04] p-5">
          <p className="mb-3 text-xs tracking-widest text-[#e8b84b]">老师联系方式（归口部门）</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label>
              <span className="mb-1 block text-[11px] text-[#9fb0c3]">部门</span>
              <input
                className={inputCls}
                value={get('contact.dept')}
                onChange={(e) => update('contact.dept', e.target.value)}
              />
            </label>
            <label>
              <span className="mb-1 block text-[11px] text-[#9fb0c3]">电话</span>
              <input
                className={inputCls}
                value={get('contact.phone')}
                onChange={(e) => update('contact.phone', e.target.value)}
              />
            </label>
            <label>
              <span className="mb-1 block text-[11px] text-[#9fb0c3]">网站</span>
              <input
                className={inputCls}
                value={get('contact.site')}
                onChange={(e) => update('contact.site', e.target.value)}
              />
            </label>
          </div>
        </div>
      )}

      {/* 条目列表 */}
      <div className="space-y-5">
        {items.map((_, i) => (
          <div key={i} className="rounded-xl border border-[rgba(238,243,248,0.1)] bg-[#0d1c33] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-sm italic text-[#e8b84b]">#{i + 1}</span>
              <button
                onClick={() => removeItem(tab, i)}
                className="flex items-center gap-1 text-xs text-red-400/80 transition-colors hover:text-red-400"
              >
                <Trash2 size={13} />
                删除
              </button>
            </div>

            {/* FAQ 条目：分类选择 */}
            {tab === 'faq' && (
              <label className="mb-3 block">
                <span className="mb-1 block text-[11px] tracking-wider text-[#9fb0c3]">所属分类</span>
                <select
                  className={inputCls}
                  value={get(`faq.items.${i}.cat`)}
                  onChange={(e) => update(`faq.items.${i}.cat`, e.target.value)}
                >
                  {FAQ_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {active.fields.map((f) => (
                <label key={f.key} className={f.multiline ? 'sm:col-span-2' : ''}>
                  <span className="mb-1 block text-[11px] tracking-wider text-[#9fb0c3]">
                    {f.label}
                  </span>
                  {f.multiline ? (
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={get(`${tab}.items.${i}.${f.key}`)}
                      onChange={(e) => update(`${tab}.items.${i}.${f.key}`, e.target.value)}
                    />
                  ) : (
                    <input
                      className={inputCls}
                      value={get(`${tab}.items.${i}.${f.key}`)}
                      onChange={(e) => update(`${tab}.items.${i}.${f.key}`, e.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>

            {/* FAQ：附件挂载 */}
            {tab === 'faq' && (
              <div className="mt-4 border-t border-[rgba(238,243,248,0.08)] pt-4">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] tracking-wider text-[#9fb0c3]">
                  <Paperclip size={12} />
                  附件（单文件 ≤ 10MB）
                </p>
                <ul className="mb-3 space-y-1.5">
                  {(content.faq.items[i].attachments ?? []).map((fid) => {
                    const meta = files.find((f) => f.id === fid)
                    return (
                      <li
                        key={fid}
                        className="flex items-center gap-2 rounded-lg border border-[rgba(238,243,248,0.1)] px-3 py-1.5 text-xs text-[#9fb0c3]"
                      >
                        <span className="truncate">{meta?.name ?? fid}</span>
                        <button
                          onClick={() => detachFile(i, fid)}
                          aria-label="移除附件"
                          className="ml-auto text-red-400/70 hover:text-red-400"
                        >
                          <X size={13} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <button
                  onClick={() => {
                    attachIndexRef.current = i
                    fileInputRef.current?.click()
                  }}
                  className="rounded-full border border-[#e8b84b]/40 px-4 py-1.5 text-xs text-[#e8b84b] transition-colors hover:bg-[#e8b84b]/10"
                >
                  上传附件
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {uploadError && <p className="mt-3 text-xs text-red-400">{uploadError}</p>}

      {/* 新增条目（FAQ 需选分类） */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {tab === 'faq' && (
          <select
            className={`${inputCls} w-auto`}
            value={newCat}
            onChange={(e) => setNewCat(e.target.value as FaqCategory)}
          >
            {FAQ_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={() => addItem(tab, tab === 'faq' ? newCat : undefined)}
          className="flex items-center gap-2 rounded-full border border-dashed border-[#e8b84b]/50 px-6 py-2.5 text-sm text-[#e8b84b] transition-colors hover:bg-[#e8b84b]/10"
        >
          <Plus size={15} />
          新增条目
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        className="hidden"
        onChange={(e) => {
          onPickFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
