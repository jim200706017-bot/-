import { useEffect, useState } from 'react'
import { FileText, Paperclip } from 'lucide-react'
import { getAllFiles, openFileInNewTab, type FileMeta } from '@/lib/db'

/** 学生端附件列表：点击在新标签页预览/下载 */
export default function Attachments({ ids }: { ids: string[] }) {
  const [metas, setMetas] = useState<FileMeta[]>([])

  useEffect(() => {
    if (ids.length === 0) {
      setMetas([])
      return
    }
    let cancelled = false
    getAllFiles().then((all) => {
      if (!cancelled) setMetas(all.filter((f) => ids.includes(f.id)))
    })
    return () => {
      cancelled = true
    }
  }, [ids])

  if (metas.length === 0) return null

  return (
    <ul className="mt-5 space-y-2 border-t border-[rgba(238,243,248,0.08)] pt-4">
      {metas.map((f) => (
        <li key={f.id}>
          <button
            onClick={() => openFileInNewTab(f.id)}
            className="group flex w-full items-center gap-2.5 rounded-lg border border-[rgba(238,243,248,0.1)] px-3.5 py-2 text-left text-xs text-[#9fb0c3] transition-colors hover:border-[#e8b84b]/40 hover:text-[#eef3f8]"
          >
            <FileText size={14} className="shrink-0 text-[#e8b84b]" />
            <span className="truncate">{f.name}</span>
            <span className="ml-auto shrink-0 text-[10px] text-[#9fb0c3]/60">
              {(f.size / 1024).toFixed(1)} KB · 预览
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/** 附件角标（卡片标题区提示有附件） */
export function AttachmentBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-[#e8b84b]/80">
      <Paperclip size={12} />
      {count}
    </span>
  )
}
