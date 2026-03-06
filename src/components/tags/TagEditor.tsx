import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Plus, Tag } from 'lucide-react'
import { PREDEFINED_TAGS } from '@/lib/types'
import { TAG_CONFIG } from '@/lib/constants'
import { useTags } from '@/hooks/useTags'

interface TagEditorProps {
  tableId: string
  tags: string[]
  onTagsUpdated?: () => void
}

/** Get tag display color — uses predefined config or falls back to neutral */
function getTagStyle(tag: string): { color: string; bg: string } {
  const config = TAG_CONFIG[tag as keyof typeof TAG_CONFIG]
  if (config) return { color: config.color, bg: config.bg }
  return { color: '#8b5cf6', bg: '#8b5cf618' }
}

export function TagEditor({ tableId, tags, onTagsUpdated }: TagEditorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { isLoading, updateTags } = useTags()

  // Focus input when opening
  useEffect(() => {
    if (isAdding) inputRef.current?.focus()
  }, [isAdding])

  // Close dropdown on outside click
  useEffect(() => {
    if (!isAdding) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAdding(false)
        setCustomInput('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isAdding])

  const handleAddTag = useCallback(async (tag: string) => {
    const normalized = tag.toLowerCase().trim().replace(/\s+/g, '-')
    if (!normalized || tags.includes(normalized)) return

    const newTags = [...tags, normalized]
    const success = await updateTags(tableId, newTags)
    if (success) {
      onTagsUpdated?.()
      setCustomInput('')
    }
  }, [tableId, tags, updateTags, onTagsUpdated])

  const handleRemoveTag = useCallback(async (tag: string) => {
    const newTags = tags.filter((t) => t !== tag)
    const success = await updateTags(tableId, newTags)
    if (success) onTagsUpdated?.()
  }, [tableId, tags, updateTags, onTagsUpdated])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customInput.trim()) {
      e.preventDefault()
      handleAddTag(customInput)
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setCustomInput('')
    }
  }, [customInput, handleAddTag])

  // Predefined tags not already applied
  const availablePredefined = PREDEFINED_TAGS.filter((t) => !tags.includes(t))

  return (
    <div className="space-y-1.5">
      {/* Existing tags */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Tag className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
        {tags.length === 0 && !isAdding && (
          <span className="text-xs text-[var(--muted-foreground)] italic">No tags</span>
        )}
        {tags.map((tag) => {
          const style = getTagStyle(tag)
          return (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded-md border"
              style={{
                backgroundColor: style.bg,
                color: style.color,
                borderColor: `${style.color}30`,
              }}
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                disabled={isLoading}
                className="hover:opacity-70 cursor-pointer"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )
        })}

        {/* Add button */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] text-[var(--muted-foreground)]
              rounded-md border border-dashed border-[var(--border)] hover:bg-[var(--muted)] cursor-pointer transition-colors"
          >
            <Plus className="h-2.5 w-2.5" />
            tag
          </button>
        )}
      </div>

      {/* Add tag dropdown */}
      {isAdding && (
        <div ref={dropdownRef} className="border border-[var(--border)] rounded-md bg-[var(--card)] shadow-md p-2 space-y-1.5">
          {/* Custom input */}
          <input
            ref={inputRef}
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type custom tag..."
            className="w-full px-2 py-1 text-xs bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
          />

          {/* Predefined suggestions */}
          {availablePredefined.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {availablePredefined.map((tag) => {
                const config = TAG_CONFIG[tag]
                return (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    disabled={isLoading}
                    className="px-1.5 py-0.5 text-[11px] font-medium rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: config.bg,
                      color: config.color,
                      borderColor: `${config.color}30`,
                    }}
                  >
                    {config.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Read-only tag chips for table browser */
export function TagChips({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tags.map((tag) => {
        const style = getTagStyle(tag)
        return (
          <span
            key={tag}
            className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded"
            style={{
              backgroundColor: style.bg,
              color: style.color,
            }}
          >
            {tag}
          </span>
        )
      })}
    </div>
  )
}
