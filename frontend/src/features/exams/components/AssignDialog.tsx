import { useEffect, useState } from 'react'
import { Button } from '@/design-system/components/Button'
import { XIcon } from '@/design-system/icons'
import { ApiError } from '@/lib/apiClient'
import { useAssignStudents, useExam, useStudents } from '../api'
import { StudentMultiSelect } from './StudentMultiSelect'

type AssignDialogProps = {
  examId: string
  examTitle: string
  onClose: () => void
}

/** Modal to manage which students an existing exam is assigned to. */
export function AssignDialog({ examId, examTitle, onClose }: AssignDialogProps) {
  const { data: students } = useStudents()
  const { data: exam, isLoading } = useExam(examId)
  const assign = useAssignStudents(examId)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Seed the selection from the exam's current assignments once it loads.
  useEffect(() => {
    if (exam && !initialized) {
      setSelectedIds(exam.assignedStudentIds ?? [])
      setInitialized(true)
    }
  }, [exam, initialized])

  function handleSave() {
    setError(null)
    assign.mutate(selectedIds, {
      onSuccess: onClose,
      onError: (err) =>
        setError(err instanceof ApiError ? err.message : 'No se pudo guardar la asignación.'),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-main/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Asignar alumnos a ${examTitle}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-nunito text-xl font-bold text-main">Asignar alumnos</h2>
            <p className="font-inter mt-0.5 text-sm text-main/70">{examTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-main/60 transition-colors hover:text-accent"
          >
            <XIcon />
          </button>
        </div>

        {isLoading ? (
          <p className="font-inter py-8 text-center text-main/70">Cargando…</p>
        ) : (
          <StudentMultiSelect
            students={students ?? []}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            className="max-h-72"
          />
        )}

        {error && (
          <p role="alert" className="font-inter mt-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="accent" onClick={handleSave} disabled={assign.isPending || isLoading}>
            {assign.isPending ? 'Guardando…' : 'Guardar asignación'}
          </Button>
        </div>
      </div>
    </div>
  )
}
