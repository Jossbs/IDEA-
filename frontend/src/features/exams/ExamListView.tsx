import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import {
  CalendarIcon,
  EyeIcon,
  FileTextIcon,
  GaugeIcon,
  PencilIcon,
  SearchIcon,
  SendIcon,
} from '@/design-system/icons'
import { ACADEMIC_LEVEL_LABELS } from '@/features/subjects/types'
import { ApiError } from '@/lib/apiClient'
import { cn } from '@/lib/cn'
import { useExams } from './api'
import { AssignDialog } from './components/AssignDialog'
import type { ExamSummary } from './types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ published }: { published: boolean }) {
  return published ? (
    <span className="font-inter rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
      Publicado
    </span>
  ) : (
    <span className="font-inter rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary/70">
      Borrador
    </span>
  )
}

type CardActionProps = {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

function CardAction({ icon, label, onClick }: CardActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-inter inline-flex items-center gap-1.5 text-sm font-medium text-secondary/70 transition-colors hover:text-accent"
    >
      {icon}
      {label}
    </button>
  )
}

function ExamCard({ exam, onAssign }: { exam: ExamSummary; onAssign: (exam: ExamSummary) => void }) {
  const navigate = useNavigate()
  return (
    <Card className="relative flex flex-col gap-4 shadow-sm transition-shadow hover:shadow-card">
      <span className="absolute right-4 top-4">
        <StatusBadge published={exam.published} />
      </span>

      <div className="pr-24">
        <h3 className="font-nunito text-lg font-bold text-secondary">{exam.title}</h3>
        <p className="font-inter mt-0.5 text-sm text-secondary/70">
          {exam.subjectName} · {ACADEMIC_LEVEL_LABELS[exam.academicLevel]}
        </p>
      </div>

      <div className="font-inter flex flex-wrap items-center gap-4 text-sm text-secondary/70">
        <span className="inline-flex items-center gap-1.5">
          <FileTextIcon className="size-4" />
          {exam.questionCount} {exam.questionCount === 1 ? 'pregunta' : 'preguntas'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon className="size-4" />
          {formatDate(exam.updateTimestamp)}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-secondary/10 pt-3">
        <CardAction
          icon={<PencilIcon className="size-4" />}
          label="Editar"
          onClick={() => navigate(`/exams/${exam.examId}/edit`)}
        />
        <CardAction
          icon={<EyeIcon className="size-4" />}
          label="Previsualizar"
          onClick={() => navigate(`/exams/${exam.examId}/preview`)}
        />
        <CardAction
          icon={<SendIcon className="size-4" />}
          label="Asignar"
          onClick={() => onAssign(exam)}
        />
        <CardAction
          icon={<GaugeIcon className="size-4" />}
          label="Resultados"
          onClick={() => navigate(`/exams/${exam.examId}/results`)}
        />
      </div>
    </Card>
  )
}

/** Teacher dashboard listing every authored exam as a premium card. */
export function ExamListView() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [assignTarget, setAssignTarget] = useState<ExamSummary | null>(null)
  const { data: exams, isLoading, isError, error } = useExams()

  const filtered = useMemo(() => {
    if (!exams) return []
    const q = query.trim().toLowerCase()
    if (!q) return exams
    return exams.filter(
      (exam) =>
        exam.title.toLowerCase().includes(q) || exam.subjectName.toLowerCase().includes(q),
    )
  }, [exams, query])

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-secondary">Mis Evaluaciones</h1>
          <p className="font-inter mt-1 text-secondary/70">
            Administra tus exámenes: borradores y publicados.
          </p>
        </div>
        <Button variant="accent" onClick={() => navigate('/exams/new')}>
          + Nuevo Examen
        </Button>
      </header>

      {/* Search */}
      <div className="relative max-w-md">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary/50" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar examen por nombre o materia"
          placeholder="Buscar examen por nombre o materia…"
          className="font-inter w-full rounded-lg border border-secondary/20 bg-white py-2 pl-9 pr-3 text-secondary placeholder:text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-base"
        />
      </div>

      {/* States: loading → error → empty → results */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-secondary/[0.04] shadow-sm" />
          ))}
        </div>
      ) : isError ? (
        <Card className="font-inter text-danger shadow-sm">
          No se pudieron cargar los exámenes
          {error instanceof ApiError ? `: ${error.message}` : '.'}
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="font-inter grid gap-3 text-secondary/70 shadow-sm">
          {query.trim() ? (
            <p>No se encontraron exámenes que coincidan con «{query}».</p>
          ) : (
            <>
              <p className="font-nunito text-lg font-bold text-secondary">
                Aún no has creado exámenes.
              </p>
              <p>Crea tu primer examen para empezar a evaluar a tus alumnos.</p>
              <Button variant="accent" className="w-fit" onClick={() => navigate('/exams/new')}>
                + Crear mi primer examen
              </Button>
            </>
          )}
        </Card>
      ) : (
        <div className={cn('grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3')}>
          {filtered.map((exam) => (
            <ExamCard key={exam.examId} exam={exam} onAssign={setAssignTarget} />
          ))}
        </div>
      )}

      {assignTarget && (
        <AssignDialog
          examId={assignTarget.examId}
          examTitle={assignTarget.title}
          onClose={() => setAssignTarget(null)}
        />
      )}
    </div>
  )
}
