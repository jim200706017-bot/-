import { useEffect, useRef, useState } from 'react'
import { FileText, Pencil, Trash2, Upload } from 'lucide-react'
import {
  deleteFile,
  getAllFiles,
  openFileInNewTab,
  putFile,
  renameFile,
  type FileMeta,
} from '@/lib/db'

/** 文件管理：全站附件列表，上传 / 重命名 / 删除（存 IndexedDB） */
export default function FileManager() {
  const [files, setFiles] = useState<FileMeta[]>([])
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const refresh = () => getAllFiles().then(setFiles)
  useEffect(() => {
    refresh()
  }, [])

  const onUpload = async (file: File | undefined) => {
    setError('')
    if (!file) return
    try {
      await putFile(file, file.name)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    }
  }

  const onRename = async (f: FileMeta) => {
    const name = window.prompt('重命名文件', f.name)
    if (!name || name === f.name) return
    await renameFile(f.id, name.trim())
    await refresh()
  }

  const onDelete = async (f: FileMeta) => {
    if (!window.confirm(`确定删除「${f.name}」？引用它的条目将失去该附件。`)) return
    await deleteFile(f.id)
    await refresh()
  }

  return (
    <div>
      <h2 className="font-serif-sc mb-2 text-xl font-bold text-[#eef3f8]">文件管理</h2>
      <p className="mb-6 text-xs text-[#9fb0c3]">
        全站附件统一存放于浏览器 IndexedDB（不受 localStorage 5MB 限制），单文件 ≤ 10MB。
      </p>

      <button
        onClick={() => inputRef.current?.click()}
        className="mb-6 flex items-center gap-2 rounded-full border border-[#e8b84b] px-6 py-2.5 text-sm text-[#e8b84b] transition-colors hover:bg-[#e8b84b] hover:text-[#0a1628]"
      >
        <Upload size={15} />
        上传文件
      </button>
      {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

      {files.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[rgba(238,243,248,0.15)] p-8 text-center text-sm text-[#9fb0c3]">
          暂无文件
        </p>
      ) : (
        <ul className="space-y-2.5">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-xl border border-[rgba(238,243,248,0.1)] bg-[#0d1c33] px-4 py-3"
            >
              <FileText size={16} className="shrink-0 text-[#e8b84b]" />
              <button
                onClick={() => openFileInNewTab(f.id)}
                className="truncate text-sm text-[#eef3f8] hover:text-[#e8b84b]"
                title="点击预览"
              >
                {f.name}
              </button>
              <span className="ml-auto shrink-0 text-[11px] text-[#9fb0c3]/70">
                {(f.size / 1024).toFixed(1)} KB · {new Date(f.createdAt).toLocaleDateString('zh-CN')}
              </span>
              <button
                onClick={() => onRename(f)}
                aria-label="重命名"
                className="shrink-0 text-[#9fb0c3] transition-colors hover:text-[#eef3f8]"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(f)}
                aria-label="删除"
                className="shrink-0 text-red-400/70 transition-colors hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        className="hidden"
        onChange={(e) => {
          onUpload(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
