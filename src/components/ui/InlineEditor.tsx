import { useState, useRef, useEffect, useCallback } from 'react'
import { Pencil, Check, X, Loader2 } from 'lucide-react'
import { Button } from './button'

interface InlineEditorProps {
  value: string
  placeholder?: string
  onSave: (newValue: string) => Promise<void>
  isLoading?: boolean
  multiline?: boolean
  className?: string
}

export function InlineEditor({
  value,
  placeholder = 'No description',
  onSave,
  isLoading = false,
  multiline = true,
  className = '',
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = useCallback(async () => {
    const trimmed = draft.trim()
    if (trimmed === value) {
      setIsEditing(false)
      return
    }
    await onSave(trimmed)
    setIsEditing(false)
  }, [draft, value, onSave])

  const handleCancel = useCallback(() => {
    setDraft(value)
    setIsEditing(false)
  }, [value])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel()
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSave()
      }
    },
    [handleCancel, handleSave],
  )

  if (isEditing) {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="w-full text-sm bg-[var(--background)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y"
            placeholder={placeholder}
            disabled={isLoading}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-sm bg-[var(--background)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            placeholder={placeholder}
            disabled={isLoading}
          />
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            disabled={isLoading}
            className="h-6 w-6"
            title="Save (Cmd+Enter)"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5 text-green-500" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-6 w-6"
            title="Cancel (Esc)"
          >
            <X className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          </Button>
          <span className="text-[10px] text-[var(--muted-foreground)] ml-1">
            Cmd+Enter to save
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group flex items-start gap-1 cursor-pointer ${className}`}
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setIsEditing(true)
      }}
      title="Click to edit"
    >
      <span
        className={`flex-1 ${
          value
            ? 'text-[var(--foreground)]'
            : 'text-[var(--muted-foreground)] italic'
        }`}
      >
        {value || placeholder}
      </span>
      <Pencil className="h-3 w-3 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
    </div>
  )
}
