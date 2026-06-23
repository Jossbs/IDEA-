import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import { SelectField, TextField } from '@/design-system/components/Field'
import {
  AwardIcon,
  CalendarIcon,
  CopyIcon,
  EyeIcon,
  FileTextIcon,
  GaugeIcon,
  PencilIcon,
  SearchIcon,
  SendIcon,
} from '@/design-system/icons'
import { ACADEMIC_LEVEL_LABELS, ACADEMIC_LEVELS } from '@/features/subjects/types'
import type { AcademicLevel } from '@/features/subjects/types'
import { ApiError } from '@/lib/apiClient'
import { cn } from '@/lib/cn'
import { useDuplicateExam, useExams } from './api'
import { AssignDialog } from './components/AssignDialog'
import type { ExamSummary } from './types'

/** Status filter values. */
type StatusFilter = 'all' | 'published' | 'draft'

/** Active filter state for the exam list. */
type Filters = {
  query: string
  subject: string
  level: AcademicLevel | 'all'
  status: StatusFilter
  /** A single day (YYYY-MM-DD) to match exams created/updated that date. */
  date: string
}

const EMPTY_FILTERS: Filters = {
  query: '',
  subject: 'all',
  level: 'all',
  status: 'all',
  date: '',
}

function hasActiveFilters(f: Filters): boolean {
  return (
    f.query.trim() !== '' ||
    f.subject !== 'all' ||
    f.level !== 'all' ||
    f.status !== 'all' ||
    f.date !== ''
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Rounds to one decimal and normalizes -0 → 0. */
function round1(n: number): number {
  return Math.round(n * 10) / 10 || 0
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

function ExamCard({
  exam,
  onAssign,
  onDuplicate,
  duplicating,
}: {
  exam: ExamSummary
  onAssign: (exam: ExamSummary) => void
  onDuplicate: (exam: ExamSummary) => void
  duplicating: boolean
}) {
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
          <GaugeIcon className="size-4" />
          {exam.totalPoints} pts · acredita {exam.passingScore}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon className="size-4" />
          {exam.dueAt ? `Entrega ${formatDate(exam.dueAt)}` : formatDate(exam.updateTimestamp)}
        </span>
      </div>

      {/* Average grade across submissions, once there are any. */}
      <div className="font-inter -mt-1 flex items-center gap-1.5 text-sm">
        <AwardIcon className="size-4 text-primary/70" />
        {exam.averageScore != null ? (
          <span className="text-secondary/80">
            Calificación promedio:{' '}
            <span className="font-nunito font-bold tabular-nums text-primary">
              {round1(exam.averageScore)}
            </span>
            <span className="text-secondary/50"> / {exam.totalPoints}</span>
          </span>
        ) : (
          <span className="text-secondary/50">Sin entregas todavía</span>
        )}
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
          icon={<CopyIcon className="size-4" />}
          label={duplicating ? 'Duplicando…' : 'Duplicar'}
          onClick={() => onDuplicate(exam)}
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
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [assignTarget, setAssignTarget] = useState<ExamSummary | null>(null)
  const { data: exams, isLoading, isError, error } = useExams()
  const duplicate = useDuplicateExam()

  function handleDuplicate(exam: ExamSummary) {
    if (duplicate.isPending) return
    duplicate.mutate(exam.examId, {
      // Land on the copy's edit form so the teacher can tweak the reactivos.
      onSuccess: (res) => navigate(`/exams/${res.examId}/edit`),
    })
  }

  // Subjects present in the teacher's exams, for the materia dropdown.
  const subjectOptions = useMemo(
    () => Array.from(new Set((exams ?? []).map((e) => e.subjectName))).sort((a, b) => a.localeCompare(b)),
    [exams],
  )
  // Academic levels actually present, in the canonical order.
  const levelOptions = useMemo(() => {
    const present = new Set((exams ?? []).map((e) => e.academicLevel))
    return ACADEMIC_LEVELS.filter((l) => present.has(l))
  }, [exams])

  const filtered = useMemo(() => {
    if (!exams) return []
    const q = filters.query.trim().toLowerCase()
    // A single day window [00:00, next day 00:00) — matches exams of that date.
    const dayStart = filters.date ? new Date(`${filters.date}T00:00:00`) : null
    const dayEnd = dayStart ? new Date(dayStart.getTime() + 24 * 60 * 60 * 1000) : null
    return exams.filter((exam) => {
      if (q && !exam.title.toLowerCase().includes(q) && !exam.subjectName.toLowerCase().includes(q)) {
        return false
      }
      if (filters.subject !== 'all' && exam.subjectName !== filters.subject) return false
      if (filters.level !== 'all' && exam.academicLevel !== filters.level) return false
      if (filters.status === 'published' && !exam.published) return false
      if (filters.status === 'draft' && exam.published) return false
      if (dayStart && dayEnd) {
        const updated = new Date(exam.updateTimestamp)
        if (updated < dayStart || updated >= dayEnd) return false
      }
      return true
    })
  }, [exams, filters])

  const filtersActive = hasActiveFilters(filters)

  function patch(partial: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...partial }))
  }

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

      {/* Filters */}
      <Card className="grid gap-4 shadow-sm">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary/50" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => patch({ query: e.target.value })}
            aria-label="Buscar examen por nombre o materia"
            placeholder="Buscar por título o materia…"
            className="font-inter w-full rounded-lg border border-secondary/20 bg-surface py-2 pl-9 pr-3 text-secondary placeholder:text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            label="Materia"
            value={filters.subject}
            onChange={(e) => patch({ subject: e.target.value })}
          >
            <option value="all">Todas</option>
            {subjectOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Nivel"
            value={filters.level}
            onChange={(e) => patch({ level: e.target.value as AcademicLevel | 'all' })}
          >
            <option value="all">Todos</option>
            {levelOptions.map((level) => (
              <option key={level} value={level}>
                {ACADEMIC_LEVEL_LABELS[level]}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Estado"
            value={filters.status}
            onChange={(e) => patch({ status: e.target.value as StatusFilter })}
          >
            <option value="all">Todos</option>
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
          </SelectField>

          <TextField
            label="Fecha"
            type="date"
            value={filters.date}
            onChange={(e) => patch({ date: e.target.value })}
          />
        </div>

        {filtersActive && (
          <div className="flex items-center justify-between gap-3 border-t border-secondary/10 pt-3">
            <p className="font-inter text-sm text-secondary/60">
              {filtered.length} {filtered.length === 1 ? 'examen' : 'exámenes'} encontrados
            </p>
            <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
              Limpiar filtros
            </Button>
          </div>
        )}
      </Card>

      {duplicate.isError && (
        <p role="alert" className="font-inter text-sm text-danger">
          No se pudo duplicar el examen
          {duplicate.error instanceof ApiError ? `: ${duplicate.error.message}` : '.'}
        </p>
      )}

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
          {filtersActive ? (
            <div className="grid gap-3">
              <p>No se encontraron exámenes con los filtros aplicados.</p>
              <Button variant="ghost" className="w-fit" onClick={() => setFilters(EMPTY_FILTERS)}>
                Limpiar filtros
              </Button>
            </div>
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
            <ExamCard
              key={exam.examId}
              exam={exam}
              onAssign={setAssignTarget}
              onDuplicate={handleDuplicate}
              duplicating={duplicate.isPending && duplicate.variables === exam.examId}
            />
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
