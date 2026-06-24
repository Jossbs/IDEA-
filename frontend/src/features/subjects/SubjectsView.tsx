import { useState } from 'react'
import { Card } from '@/design-system/components/Card'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { Switch } from '@/design-system/components/Switch'
import { BanIcon, PencilIcon, PowerIcon, TrashIcon } from '@/design-system/icons'
import { useToast } from '@/design-system/toast/ToastProvider'
import { cn } from '@/lib/cn'
import { useDeleteSubject, useSetSubjectActive, useSubjects } from './api'
import { SubjectFormPanel } from './SubjectFormPanel'
import { ACADEMIC_LEVEL_LABELS } from './types'
import type { Subject } from './types'

/**
 * Shared column template so the header row and data rows stay aligned.
 * The last column is a fixed width (not `auto`) — each row is its own grid
 * container, so an `auto` column would size to its own content and break
 * alignment with the header.
 */
const ROW_GRID = 'grid grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_7rem_9rem] items-center gap-4'

/** Soft status pill: success-tinted for active records, neutral for inactive. */
function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center rounded-full bg-success-bg px-2 py-1 text-xs font-medium text-success-text">
      Activa
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-muted">
      Inactiva
    </span>
  )
}

/** Transparent, hairline-bordered icon button that takes a semantic color on hover. */
function RowAction({
  icon,
  label,
  hover,
  onClick,
  disabled,
}: {
  icon: React.ReactNode
  label: string
  hover: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'rounded-md border border-subtle p-2 text-muted transition-colors disabled:opacity-50',
        hover,
      )}
    >
      {icon}
    </button>
  )
}

/** Teacher-facing screen to manage the subjects catalog. */
export function SubjectsView() {
  const toast = useToast()
  const [includeInactive, setIncludeInactive] = useState(false)
  const [editing, setEditing] = useState<Subject | undefined>(undefined)
  const [toDelete, setToDelete] = useState<Subject | undefined>(undefined)

  const { data: subjects, isLoading, isError, error } = useSubjects(includeInactive)
  const setActive = useSetSubjectActive()
  const deleteSubject = useDeleteSubject()

  const hasSubjects = subjects && subjects.length > 0

  function handleToggleActive(subject: Subject) {
    const next = !subject.activeRecord
    setActive.mutate(
      { id: subject.subjectIdentifier, active: next },
      {
        onSuccess: () =>
          toast.success(`Materia ${next ? 'activada' : 'desactivada'}.`),
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : 'No se pudo cambiar el estado.'),
      },
    )
  }

  function confirmDelete() {
    if (!toDelete) return
    const target = toDelete
    deleteSubject.mutate(target.subjectIdentifier, {
      onSuccess: () => {
        toast.success(`Materia "${target.subjectName}" eliminada.`)
        if (editing?.subjectIdentifier === target.subjectIdentifier) setEditing(undefined)
        setToDelete(undefined)
      },
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : 'No se pudo eliminar la materia.'),
    })
  }

  return (
    <div className="grid gap-8">
      {/* Page header */}
      <header>
        <h1 className="text-3xl font-bold text-main">Materias</h1>
        <p className="mt-1 text-muted">
          Catálogo de materias académicas a las que pertenece un examen.
        </p>
      </header>

      {/* Two columns: subjects table (left) + persistent form panel (right) */}
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <section className="grid gap-4">
          {/* Inactive filter — visual switch (logic unchanged). */}
          <div className="flex w-fit items-center gap-2.5">
            <Switch
              checked={includeInactive}
              onChange={setIncludeInactive}
              aria-label="Mostrar materias inactivas"
            />
            <span
              onClick={() => setIncludeInactive(!includeInactive)}
              className="cursor-pointer select-none text-sm text-muted"
            >
              Mostrar materias inactivas
            </span>
          </div>

          {isLoading && <Card className="text-muted">Cargando materias…</Card>}

          {isError && (
            <Card className="text-danger-text">
              No se pudieron cargar las materias: {(error as Error).message}
            </Card>
          )}

          {!isLoading && !isError && !hasSubjects && (
            <Card className="text-muted">
              Aún no hay materias. Crea la primera con “Nueva materia”.
            </Card>
          )}

          {!isLoading && !isError && hasSubjects && (
            <div className="overflow-hidden rounded-lg border border-subtle bg-surface shadow-sm">
              {/* Header row */}
              <div
                className={`${ROW_GRID} border-b border-subtle px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted`}
              >
                <span>Nombre</span>
                <span>Nivel</span>
                <span>Estado</span>
                <span className="text-right">Acciones</span>
              </div>

              {/* Data rows */}
              <ul>
                {subjects.map((subject) => (
                  <li
                    key={subject.subjectIdentifier}
                    className={`${ROW_GRID} border-b border-subtle px-5 py-3.5 transition-colors last:border-0 hover:bg-app`}
                  >
                    <span className="truncate font-semibold text-main">{subject.subjectName}</span>
                    <span className="text-muted">
                      {ACADEMIC_LEVEL_LABELS[subject.academicLevel]}
                    </span>
                    <span>
                      <StatusBadge active={subject.activeRecord} />
                    </span>
                    <div className="flex justify-end gap-1.5">
                      <RowAction
                        icon={<PencilIcon />}
                        label="Editar"
                        hover="hover:border-primary hover:text-primary"
                        onClick={() => setEditing(subject)}
                      />
                      <RowAction
                        icon={subject.activeRecord ? <BanIcon /> : <PowerIcon />}
                        label={subject.activeRecord ? 'Desactivar' : 'Activar'}
                        hover={
                          subject.activeRecord
                            ? 'hover:border-warning hover:bg-warning-bg hover:text-warning-text'
                            : 'hover:border-success hover:bg-success-bg hover:text-success-text'
                        }
                        disabled={setActive.isPending}
                        onClick={() => handleToggleActive(subject)}
                      />
                      <RowAction
                        icon={<TrashIcon />}
                        label="Eliminar"
                        hover="hover:border-danger hover:bg-danger-bg hover:text-danger-text"
                        disabled={deleteSubject.isPending}
                        onClick={() => setToDelete(subject)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside>
          <SubjectFormPanel
            key={editing?.subjectIdentifier ?? 'new'}
            subject={editing}
            onCancel={() => setEditing(undefined)}
            onSaved={() => setEditing(undefined)}
          />
        </aside>
      </div>

      {/* Delete confirmation — replaces window.confirm(). */}
      {toDelete && (
        <ConfirmDialog
          title={`¿Eliminar la materia "${toDelete.subjectName}"?`}
          description="Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          pending={deleteSubject.isPending}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(undefined)}
        />
      )}
    </div>
  )
}
