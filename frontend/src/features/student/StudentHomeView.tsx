import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import {
  AwardIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  FileTextIcon,
  GaugeIcon,
  SearchIcon,
} from '@/design-system/icons'
import { useAuth } from '@/features/auth/AuthContext'
import { ACADEMIC_LEVEL_LABELS } from '@/features/subjects/types'
import { ApiError } from '@/lib/apiClient'
import { cn } from '@/lib/cn'
import { useAvailableExams } from './api'
import type { StudentExamCard } from './types'

/** Rounds to one decimal and normalizes -0 → 0. */
function round1(n: number): number {
  return Math.round(n * 10) / 10 || 0
}

/** Formats an ISO deadline for the student cards. */
function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Student dashboard: every assigned exam — pending to take and already graded. */
export function StudentHomeView() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const { data: exams, isLoading, isError, error } = useAvailableExams()

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
      <header>
        <h1 className="font-nunito text-3xl font-extrabold text-secondary">
          Hola, {user?.fullName}
        </h1>
        <p className="font-inter mt-1 text-secondary/70">
          Tus exámenes asignados y los que ya fueron calificados.
        </p>
      </header>

      {/* Search */}
      <div className="relative max-w-md">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary/50" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar examen por nombre o materia"
          placeholder="Buscar por título o materia…"
          className="font-inter w-full rounded-lg border border-secondary/20 bg-white py-2 pl-9 pr-3 text-secondary placeholder:text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-base"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="h-44 animate-pulse bg-secondary/[0.04] shadow-sm" />
          ))}
        </div>
      ) : isError ? (
        <Card className="font-inter text-danger shadow-sm">
          No se pudieron cargar los exámenes
          {error instanceof ApiError ? `: ${error.message}` : '.'}
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="font-inter text-secondary/70 shadow-sm">
          {query.trim()
            ? `No se encontraron exámenes que coincidan con «${query}».`
            : 'Aún no tienes exámenes asignados. Vuelve más tarde.'}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exam) => (
            <StudentExamCardView key={exam.examId} exam={exam} />
          ))}
        </div>
      )}
    </div>
  )
}

function StudentExamCardView({ exam }: { exam: StudentExamCard }) {
  const navigate = useNavigate()
  const graded = exam.attemptStatus === 'GRADED'
  const pending = exam.attemptStatus === 'PENDING_REVIEW'
  const accredited = graded && exam.score != null && exam.score >= exam.passingScore

  return (
    <Card className="flex flex-col gap-4 shadow-sm">
      <div>
        <h3 className="font-nunito text-lg font-bold text-secondary">{exam.title}</h3>
        <p className="font-inter mt-0.5 text-sm text-secondary/70">
          {exam.subjectName} · {ACADEMIC_LEVEL_LABELS[exam.academicLevel]}
        </p>
      </div>

      <div className="font-inter flex flex-col gap-1.5 text-sm text-secondary/70">
        <span className="inline-flex items-center gap-1.5">
          <FileTextIcon className="size-4" />
          {exam.questionCount} {exam.questionCount === 1 ? 'pregunta' : 'preguntas'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <GaugeIcon className="size-4" />
          Vale {exam.totalPoints} pts · acreditas con {exam.passingScore}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon className="size-4" />
          {exam.dueAt ? `Entrega: ${formatDueDate(exam.dueAt)}` : 'Sin fecha de entrega'}
        </span>
        {exam.averageScore != null && (
          <span className="inline-flex items-center gap-1.5">
            <AwardIcon className="size-4" />
            Promedio del grupo: {round1(exam.averageScore)} / {exam.totalPoints}
          </span>
        )}
      </div>

      {/* Graded: show the score and whether the student accredited. */}
      {graded && (
        <div className={cn('rounded-lg px-4 py-3', accredited ? 'bg-success/10' : 'bg-danger/10')}>
          <p
            className={cn(
              'font-inter text-xs font-semibold uppercase tracking-wide',
              accredited ? 'text-success' : 'text-danger',
            )}
          >
            {accredited ? 'Acreditado' : 'No acreditado'}
          </p>
          <p
            className={cn(
              'font-nunito mt-0.5 text-2xl font-extrabold tabular-nums',
              accredited ? 'text-success' : 'text-danger',
            )}
          >
            {exam.score}
            <span className="text-base font-bold text-secondary/40"> / {exam.maxScore}</span>
          </p>
          <p className="font-inter mt-0.5 text-xs text-secondary/60">
            Mínimo para acreditar: {exam.passingScore}
          </p>
        </div>
      )}
      {pending && (
        <div className="rounded-lg bg-accent/10 px-4 py-3">
          <p className="font-inter inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
            <ClockIcon className="size-4" />
            En revisión del docente
          </p>
          <p className="font-inter mt-0.5 text-xs text-secondary/60">
            Puntaje parcial: {exam.score} / {exam.maxScore}
          </p>
        </div>
      )}

      <div className="mt-auto pt-2">
        {!exam.alreadyTaken ? (
          <Button variant="accent" fullWidth onClick={() => navigate(`/exam/${exam.examId}/take`)}>
            Resolver examen
          </Button>
        ) : (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate(`/exam/${exam.examId}/result`)}
          >
            {graded ? <CheckCircleIcon className="size-4" /> : <EyeIcon className="size-4" />}
            Ver mis respuestas
          </Button>
        )}
      </div>
    </Card>
  )
}
