import { useState } from 'react'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import { CustomSelect } from '@/design-system/components/CustomSelect'
import { TextField } from '@/design-system/components/Field'
import { useToast } from '@/design-system/toast/ToastProvider'
import { ApiError } from '@/lib/apiClient'
import { useCreateSubject, useUpdateSubject } from './api'
import {
  ACADEMIC_LEVELS,
  ACADEMIC_LEVEL_LABELS,
  SUBJECT_CATALOG,
  SUBJECT_CATALOG_OTHER,
} from './types'
import type { AcademicLevel, Subject } from './types'

/** Picks the initial dropdown value: a catalog entry, or "Otro" for custom names. */
function initialCatalogValue(name: string | undefined): string {
  if (!name) return ''
  return (SUBJECT_CATALOG as readonly string[]).includes(name) ? name : SUBJECT_CATALOG_OTHER
}

type SubjectFormPanelProps = {
  /** When provided, the panel edits this subject; otherwise it creates one. */
  subject?: Subject
  onCancel: () => void
  onSaved: () => void
}

/**
 * Persistent side panel to create or edit a subject.
 * Remount it with a `key` (subject id / 'new') to reset its fields cleanly.
 */
export function SubjectFormPanel({ subject, onCancel, onSaved }: SubjectFormPanelProps) {
  const isEdit = Boolean(subject)
  const toast = useToast()
  const createSubject = useCreateSubject()
  const updateSubject = useUpdateSubject()

  const [catalogValue, setCatalogValue] = useState<string>(initialCatalogValue(subject?.subjectName))
  const [customName, setCustomName] = useState(
    initialCatalogValue(subject?.subjectName) === SUBJECT_CATALOG_OTHER ? (subject?.subjectName ?? '') : '',
  )
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(
    subject?.academicLevel ?? 'UNIVERSITY',
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  const pending = createSubject.isPending || updateSubject.isPending
  const isOther = catalogValue === SUBJECT_CATALOG_OTHER
  const resolvedName = (isOther ? customName : catalogValue).trim()

  const catalogOptions = [
    ...SUBJECT_CATALOG.map((name) => ({ value: name, label: name })),
    { value: SUBJECT_CATALOG_OTHER, label: 'Otro (especificar)…' },
  ]
  const levelOptions = ACADEMIC_LEVELS.map((level) => ({
    value: level,
    label: ACADEMIC_LEVEL_LABELS[level],
  }))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFieldErrors({})
    setGeneralError(null)

    if (!resolvedName) {
      setFieldErrors({ subjectName: 'Selecciona una materia o escribe su nombre.' })
      return
    }

    const request = { subjectName: resolvedName, academicLevel }

    try {
      if (isEdit && subject) {
        await updateSubject.mutateAsync({ id: subject.subjectIdentifier, request })
        toast.success(`Materia "${resolvedName}" actualizada.`)
      } else {
        await createSubject.mutateAsync(request)
        toast.success(`Materia "${resolvedName}" creada.`)
      }
      onSaved()
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors) setFieldErrors(error.fieldErrors)
        else setGeneralError(error.message)
      } else {
        setGeneralError('Ocurrió un error inesperado.')
      }
    }
  }

  return (
    <Card className="shadow-sm lg:sticky lg:top-10">
      <form onSubmit={handleSubmit} className="grid gap-5">
        <h2 className="text-xl font-bold text-main">
          {isEdit ? 'Editar materia' : 'Nueva Materia'}
        </h2>

        {generalError && (
          <div className="rounded-md border border-danger/20 bg-danger-bg px-3 py-2 text-sm text-danger-text">
            {generalError}
          </div>
        )}

        <CustomSelect
          label="Materia"
          placeholder="Selecciona una materia…"
          options={catalogOptions}
          value={catalogValue}
          onChange={setCatalogValue}
          error={!isOther ? fieldErrors.subjectName : undefined}
          autoFocus
        />

        {isOther && (
          <TextField
            label="Nombre de la materia"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Ej. Astronomía"
            error={fieldErrors.subjectName}
            autoFocus
          />
        )}

        <CustomSelect
          label="Nivel académico"
          options={levelOptions}
          value={academicLevel}
          onChange={(v) => setAcademicLevel(v as AcademicLevel)}
          error={fieldErrors.academicLevel}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" disabled={pending}>
            {pending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
