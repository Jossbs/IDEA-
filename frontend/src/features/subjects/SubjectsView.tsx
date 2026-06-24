import { useState } from 'react'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import { BanIcon, PencilIcon, PowerIcon, TrashIcon } from '@/design-system/icons'
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
const ROW_GRID =
  'grid grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_8rem_17rem] items-center gap-4'

/** Sage-green badge for active records; neutral for deactivated ones. */
function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="font-inter inline-block rounded-full bg-success/20 px-3 py-1 text-sm font-medium text-success">
      Activa
    </span>
  ) : (
    <span className="font-inter inline-block rounded-full bg-main/10 px-3 py-1 text-sm font-medium text-main/60">
      Inactiva
    </span>
  )
}

/** Teacher-facing screen to manage the subjects catalog. */
export function SubjectsView() {
  const [includeInactive, setIncludeInactive] = useState(false)
  const [editing, setEditing] = useState<Subject | undefined>(undefined)

  const { data: subjects, isLoading, isError, error } = useSubjects(includeInactive)
  const setActive = useSetSubjectActive()
  const deleteSubject = useDeleteSubject()

  const hasSubjects = subjects && subjects.length > 0

  function handleDelete(subject: Subject) {
    const confirmed = window.confirm(
      `¿Eliminar la materia "${subject.subjectName}"? Esta acción no se puede deshacer.`,
    )
    if (!confirmed) return
    deleteSubject.mutate(subject.subjectIdentifier)
    if (editing?.subjectIdentifier === subject.subjectIdentifier) setEditing(undefined)
  }

  return (
    <div className="grid gap-8">
      {/* Page header */}
      <header>
        <h1 className="font-nunito text-3xl font-extrabold text-main">Materias</h1>
        <p className="font-inter mt-1 text-main/60">
          Catálogo de materias académicas a las que pertenece un examen.
        </p>
      </header>

      {/* Two columns: subjects table (left) + persistent form panel (right) */}
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <section className="grid gap-4">
          <label className="font-inter flex w-fit items-center gap-2 text-sm text-main/70">
            <input
              type="checkbox"
              className="size-4 accent-accent"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
            />
            Mostrar materias inactivas
          </label>

          {isLoading && (
            <Card className="font-inter text-main/60 shadow-sm">Cargando materias…</Card>
          )}

          {isError && (
            <Card className="font-inter text-danger shadow-sm">
              No se pudieron cargar las materias: {(error as Error).message}
            </Card>
          )}

          {!isLoading && !isError && !hasSubjects && (
            <Card className="font-inter text-main/60 shadow-sm">
              Aún no hay materias. Crea la primera con “Nueva materia”.
            </Card>
          )}

          {!isLoading && !isError && hasSubjects && (
            <div className="grid gap-3">
              {/* Header row */}
              <div className={`${ROW_GRID} px-5 text-sm font-medium text-main/50`}>
                <span>Nombre</span>
                <span>Nivel</span>
                <span>Estado</span>
                <span className="text-right">Acciones</span>
              </div>

              {/* Data rows */}
              <ul className="grid gap-3">
                {subjects.map((subject) => (
                  <li
                    key={subject.subjectIdentifier}
                    className={`${ROW_GRID} rounded-xl bg-surface px-5 py-4 shadow-sm transition-shadow hover:shadow-card`}
                  >
                    <span className="font-inter truncate font-semibold text-main">
                      {subject.subjectName}
                    </span>
                    <span className="font-inter text-main/70">
                      {ACADEMIC_LEVEL_LABELS[subject.academicLevel]}
                    </span>
                    <span>
                      <StatusBadge active={subject.activeRecord} />
                    </span>
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setEditing(subject)}>
                        <PencilIcon />
                        Editar
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        disabled={setActive.isPending}
                        onClick={() =>
                          setActive.mutate({
                            id: subject.subjectIdentifier,
                            active: !subject.activeRecord,
                          })
                        }
                      >
                        {subject.activeRecord ? <BanIcon /> : <PowerIcon />}
                        {subject.activeRecord ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        aria-label={`Eliminar ${subject.subjectName}`}
                        title="Eliminar"
                        disabled={deleteSubject.isPending}
                        onClick={() => handleDelete(subject)}
                      >
                        <TrashIcon />
                      </Button>
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
    </div>
  )
}
