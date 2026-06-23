import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import {
  AwardIcon,
  CheckCircleIcon,
  FileTextIcon,
  GaugeIcon,
  RotateIcon,
  UsersIcon,
} from '@/design-system/icons'
import { ApiError } from '@/lib/apiClient'
import { cn } from '@/lib/cn'
import { useExamResults, useResetAttempt } from './api'
import type { ExamResults, ResultEntry } from './types'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Rounds to one decimal and normalizes -0 → 0. */
function round1(n: number): number {
  return Math.round(n * 10) / 10 || 0
}

/**
 * Teacher's results panel for an exam: quick KPIs + the grades table.
 * Auto-graded scores; rows with short-text answers stay "Pendiente" until
 * the teacher reviews them.
 */
export function ExamResultsView() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useExamResults(examId)

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-secondary">
            Resultados de la Evaluación
          </h1>
          <p className="font-inter mt-1 text-secondary/70">
            Calificaciones generadas automáticamente tras la aplicación del examen.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/exams')}>
          ← Volver a Mis Evaluaciones
        </Button>
      </header>

      {isLoading ? (
        <Card className="font-inter text-secondary/70 shadow-sm">Cargando resultados…</Card>
      ) : isError || !data ? (
        <Card className="font-inter text-danger shadow-sm">
          No se pudieron cargar los resultados
          {error instanceof ApiError ? `: ${error.message}` : '.'}
        </Card>
      ) : (
        <ResultsContent data={data} />
      )}
    </div>
  )
}

function ResultsContent({ data }: { data: ExamResults }) {
  const { examId } = useParams()
  const navigate = useNavigate()
  const reset = useResetAttempt(examId)
  const { examTitle, subjectName, maxScore, passingScore, results } = data

  function handleReset(result: ResultEntry) {
    if (reset.isPending) return
    const ok = window.confirm(
      `¿Habilitar un nuevo intento para ${result.studentName}? Su entrega actual se descartará.`,
    )
    if (ok) reset.mutate(result.attemptId)
  }

  const stats = useMemo(() => {
    const total = results.length
    const sum = results.reduce((acc, r) => acc + r.score, 0)
    const average = total > 0 ? sum / total : 0
    const passed = results.filter((r) => !r.pendingReview && r.score >= passingScore).length
    const pending = results.filter((r) => r.pendingReview).length
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0
    return { total, average, passed, passRate, pending }
  }, [results, passingScore])

  return (
    <>
      {/* KPIs */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<FileTextIcon className="size-5" />}
          label="Examen"
          value={examTitle}
          hint={subjectName}
          emphasizeValue={false}
        />
        <KpiCard icon={<UsersIcon className="size-5" />} label="Alumnos evaluados" value={String(stats.total)} />
        <KpiCard
          icon={<GaugeIcon className="size-5" />}
          label="Promedio general"
          value={`${round1(stats.average)} / ${maxScore}`}
        />
        <KpiCard
          icon={<AwardIcon className="size-5" />}
          label="Tasa de aprobación"
          value={`${stats.passRate}%`}
          hint={
            stats.pending > 0
              ? `${stats.passed} aprobados · ${stats.pending} pendientes`
              : `${stats.passed} de ${stats.total} aprobados`
          }
        />
      </section>

      {/* Grades table */}
      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-nunito text-xl font-bold text-secondary">Calificaciones</h2>
          <span className="font-inter text-sm text-secondary/60">
            Aprobatoria mínima: {passingScore} / {maxScore}
          </span>
        </div>

        {reset.isError && (
          <p role="alert" className="font-inter text-sm text-danger">
            No se pudo habilitar el reintento
            {reset.error instanceof ApiError ? `: ${reset.error.message}` : '.'}
          </p>
        )}

        {results.length === 0 ? (
          <Card className="font-inter text-secondary/70 shadow-sm">
            Aún no hay entregas para este examen.
          </Card>
        ) : (
          <Card className="overflow-hidden p-0 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="font-inter border-b border-secondary/10 bg-secondary/[0.03] text-xs font-semibold uppercase tracking-wide text-secondary/60">
                    <th className="px-6 py-3">Alumno</th>
                    <th className="px-6 py-3">Entrega</th>
                    <th className="px-6 py-3 text-right">Puntaje</th>
                    <th className="px-6 py-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="font-inter">
                  {results.map((result) => (
                    <tr
                      key={result.attemptId}
                      className="border-b border-secondary/[0.06] transition-colors last:border-0 hover:bg-secondary/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-secondary">{result.studentName}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary/60">
                        {formatDateTime(result.submittedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-nunito text-lg font-bold tabular-nums text-primary">
                          {round1(result.score)}
                        </span>
                        <span className="font-inter text-sm text-secondary/40"> / {maxScore}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <GradeBadge result={result} passingScore={passingScore} />
                          {result.pendingReview && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/exams/${examId}/attempts/${result.attemptId}/review`)
                              }
                              className="font-inter text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
                            >
                              Revisar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleReset(result)}
                            disabled={reset.isPending}
                            title="Permitir que el alumno presente de nuevo el examen"
                            className="font-inter inline-flex items-center gap-1.5 text-sm font-semibold text-secondary/60 transition-colors hover:text-accent disabled:opacity-50"
                          >
                            <RotateIcon className="size-4" />
                            Reintento
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </>
  )
}

interface KpiCardProps {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
  emphasizeValue?: boolean
}

function KpiCard({ icon, label, value, hint, emphasizeValue = true }: KpiCardProps) {
  return (
    <Card className="flex flex-col gap-3 shadow-sm">
      <div className="flex items-center gap-2 text-primary/70">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="font-inter text-sm font-medium text-secondary/60">{label}</span>
      </div>
      <p
        className={cn(
          'font-nunito font-extrabold text-primary',
          emphasizeValue ? 'text-3xl tabular-nums' : 'line-clamp-2 text-lg leading-snug',
        )}
        title={value}
      >
        {value}
      </p>
      {hint && <p className="font-inter -mt-1 text-sm text-secondary/50">{hint}</p>}
    </Card>
  )
}

function GradeBadge({ result, passingScore }: { result: ResultEntry; passingScore: number }) {
  if (result.pendingReview) {
    return (
      <span className="font-inter inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
        Pendiente de revisión
      </span>
    )
  }
  return result.score >= passingScore ? (
    <span className="font-inter inline-flex items-center gap-1.5 rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
      <CheckCircleIcon className="size-3.5" />
      Aprobado
    </span>
  ) : (
    <span className="font-inter inline-flex items-center gap-1.5 rounded-full bg-danger/20 px-3 py-1 text-xs font-semibold text-danger">
      Reprobado
    </span>
  )
}
