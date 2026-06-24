import { useMemo, useState } from 'react'
import { SearchIcon } from '@/design-system/icons'
import { cn } from '@/lib/cn'
import type { Student } from '../types'

type StudentMultiSelectProps = {
  students: Student[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  /** Optional cap on visible height; the list scrolls beyond it. */
  className?: string
}

/**
 * Searchable checklist of students to assign an exam to. Selection is a set of
 * user ids the parent owns; this only toggles membership.
 */
export function StudentMultiSelect({
  students,
  selectedIds,
  onChange,
  className,
}: StudentMultiSelectProps) {
  const [query, setQuery] = useState('')
  const selected = useMemo(() => new Set(selectedIds), [selectedIds])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students
    return students.filter(
      (s) => s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    )
  }, [students, query])

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange([...next])
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <div className="relative max-w-xs flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar alumno"
            placeholder="Buscar alumno…"
            className="font-inter w-full rounded-md border border-subtle bg-surface py-2 pl-9 pr-3 text-sm text-main transition-colors placeholder:text-muted/70 hover:border-focus focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
          />
        </div>
        <span className="font-inter ml-3 shrink-0 text-sm text-muted">
          {selected.size} seleccionado{selected.size === 1 ? '' : 's'}
        </span>
      </div>

      {students.length === 0 ? (
        <p className="font-inter rounded-lg bg-app px-3 py-2 text-sm text-muted">
          No hay alumnos registrados todavía.
        </p>
      ) : (
        <ul
          className={cn(
            'scrollbar-thin grid gap-1 overflow-y-auto rounded-lg border border-subtle p-1',
            className,
          )}
        >
          {filtered.map((student) => {
            const checked = selected.has(student.userId)
            return (
              <li key={student.userId}>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors',
                    checked ? 'bg-primary/5' : 'hover:bg-gray-50',
                  )}
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={checked}
                    onChange={() => toggle(student.userId)}
                  />
                  <span className="grid">
                    <span className="font-inter text-sm font-medium text-main">
                      {student.fullName}
                    </span>
                    <span className="font-inter text-xs text-muted">{student.email}</span>
                  </span>
                </label>
              </li>
            )
          })}
          {filtered.length === 0 && (
            <li className="font-inter px-3 py-2 text-sm text-muted">
              Sin coincidencias para «{query}».
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
