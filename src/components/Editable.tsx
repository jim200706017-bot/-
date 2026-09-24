import { useEffect, useRef, type ElementType, type KeyboardEvent } from 'react'
import { useContent } from '@/lib/content'

interface EditableProps {
  /** content 对象中的 dot-path，如 "faq.items.0.q" */
  path: string
  as?: ElementType
  className?: string
  multiline?: boolean
}

/**
 * 管理模式下变为 contentEditable，失焦保存到 localStorage；
 * 访客模式下是纯只读文本，没有任何编辑痕迹。
 */
export default function Editable({
  path,
  as: Tag = 'span',
  className,
  multiline = false,
}: EditableProps) {
  const { get, update, isAdmin } = useContent()
  const ref = useRef<HTMLElement>(null)
  const value = get(path)

  // 非编辑态下 React 正常渲染文本；编辑态交给 contentEditable 管理
  useEffect(() => {
    if (isAdmin && ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  if (!isAdmin) {
    return <Tag className={className}>{value}</Tag>
  }

  const handleBlur = () => {
    const text = ref.current?.innerText ?? ''
    if (text !== value) update(path, text)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      ;(e.target as HTMLElement).blur()
    }
    if (e.key === 'Escape') {
      if (ref.current) ref.current.innerText = value
      ;(e.target as HTMLElement).blur()
    }
  }

  return (
    <Tag
      ref={ref}
      className={`${className ?? ''} editable-active`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {value}
    </Tag>
  )
}
