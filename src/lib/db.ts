/**
 * IndexedDB 文件存储层（localStorage 5MB 限制，文件必须走这里）。
 * 结构上与未来的后端文件 API 一一对应，替换时只需改本文件实现。
 */

export interface StoredFile {
  id: string
  name: string
  mime: string
  size: number
  blob: Blob
  createdAt: number
}

export interface FileMeta {
  id: string
  name: string
  mime: string
  size: number
  createdAt: number
}

const DB_NAME = 'hmt-files'
const STORE = 'files'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode)
    const req = run(t.objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    t.oncomplete = () => db.close()
  })
}

export async function putFile(file: File | Blob, name: string, id?: string): Promise<FileMeta> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('文件超过 10MB 限制，请压缩后再上传')
  }
  const db = await openDb()
  const record: StoredFile = {
    id: id ?? `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    mime: file.type || 'application/octet-stream',
    size: file.size,
    blob: file,
    createdAt: Date.now(),
  }
  await tx(db, 'readwrite', (s) => s.put(record))
  return toMeta(record)
}

export async function getFile(id: string): Promise<StoredFile | undefined> {
  const db = await openDb()
  return tx(db, 'readonly', (s) => s.get(id) as IDBRequest<StoredFile | undefined>)
}

export async function getAllFiles(): Promise<FileMeta[]> {
  const db = await openDb()
  const all = await tx(db, 'readonly', (s) => s.getAll() as IDBRequest<StoredFile[]>)
  return all.map(toMeta).sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteFile(id: string): Promise<void> {
  const db = await openDb()
  await tx(db, 'readwrite', (s) => s.delete(id))
}

export async function renameFile(id: string, name: string): Promise<void> {
  const db = await openDb()
  const rec = await tx(db, 'readonly', (s) => s.get(id) as IDBRequest<StoredFile | undefined>)
  if (!rec) return
  rec.name = name
  await tx(db, 'readwrite', (s) => s.put(rec))
}

function toMeta(f: StoredFile): FileMeta {
  return { id: f.id, name: f.name, mime: f.mime, size: f.size, createdAt: f.createdAt }
}

/** 生成 blob URL 并在新标签页打开预览 */
export async function openFileInNewTab(id: string): Promise<void> {
  const rec = await getFile(id)
  if (!rec) return
  const url = URL.createObjectURL(rec.blob)
  window.open(url, '_blank', 'noopener')
  // 延迟回收，给新标签页加载时间
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/* ============================== 示例 PDF 种子 ============================== */

export const SEED_PDF_ID = 'seed-pdf-lianshou-guide'
const SEED_FLAG = 'hmt-files-seeded-v1'

/** 手工构造的最小单页 PDF（内容为示例说明文字） */
function buildSamplePdf(): Blob {
  const text = 'HMT Platform Sample Attachment - course selection guide (demo PDF)'
  const content = `BT /F1 14 Tf 60 750 Td (${text}) Tj ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((body, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
  })
  const xrefPos = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.forEach((o) => {
    pdf += `${String(o).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}

/** 首次启动时写入示例 PDF（幂等） */
export async function seedSampleFile(): Promise<void> {
  try {
    if (localStorage.getItem(SEED_FLAG) === '1') return
    const existing = await getFile(SEED_PDF_ID)
    if (!existing) {
      await putFile(buildSamplePdf(), '示例附件·选课避坑指南.pdf', SEED_PDF_ID)
    }
    localStorage.setItem(SEED_FLAG, '1')
  } catch {
    /* IndexedDB 不可用时静默跳过 */
  }
}
