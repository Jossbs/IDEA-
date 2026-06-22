import { useMemo } from 'react'
import { Card } from '@/design-system/components/Card'
import {
  AwardIcon,
  CheckCircleIcon,
  FileTextIcon,
  GaugeIcon,
  UsersIcon,
} from '@/design-system/icons'
import { cn } from '@/lib/cn'

/* ───────────────────────────────────────────────────────────
 * Tipos (resultados de evaluación)
 * ─────────────────────────────────────────────────────────── */

/** Una entrega calificada automáticamente por el sistema. */
export interface StudentResult {
  id: string
  studentName: string
  /** ISO datetime de la entrega. */
  submittedAt: string
  /** Puntaje obtenido sobre `maxScore`. */
  score: number
}

/** Resumen del examen cuyos resultados se revisan. */
export interface ExamResultsSummary {
  id: string
  examTitle: string
  subject: string
  /** Puntaje máximo posible (escala). */
  maxScore: number
  /** Calificación mínima aprobatoria. */
  passingScore: number
  results: StudentResult[]
}

/* ───────────────────────────────────────────────────────────
 * Datos simulados (mock) para poblar la tabla y evaluar contraste.
 * Se reemplazará por el GET de resultados cuando exista el endpoint.
 * ─────────────────────────────────────────────────────────── */
const MOCK_RESULTS: ExamResultsSummary = {
  id: 'exam-1',
  examTitle: 'Examen Parcial 1 — Cinemática',
  subject: 'Física · Bachillerato',
  maxScore: 10,
  passingScore: 6,
  results: [
    { id: 'r1', studentName: 'Ana Sofía Ramírez', submittedAt: '2026-06-20T09:14:00', score: 9.5 },
    { id: 'r2', studentName: 'Diego Hernández Cruz', submittedAt: '2026-06-20T09:21:00', score: 7.0 },
    { id: 'r3', studentName: 'Valeria Mendoza León', submittedAt: '2026-06-20T09:08:00', score: 10 },
    { id: 'r4', studentName: 'Carlos Eduardo Pérez', submittedAt: '2026-06-20T09:33:00', score: 4.5 },
    { id: 'r5', studentName: 'María Fernanda Soto', submittedAt: '2026-06-20T09:18:00', score: 8.5 },
    { id: 'r6', studentName: 'Luis Ángel Torres', submittedAt: '2026-06-20T09:41:00', score: 5.5 },
    { id: 'r7', studentName: 'Regina Castillo Vega', submittedAt: '2026-06-20T09:26:00', score: 6.0 },
    { id: 'r8', studentName: 'Emiliano Núñez Díaz', submittedAt: '2026-06-20T09:37:00', score: 3.0 },
    { id: 'r9', studentName: 'Paola Jiménez Rosas', submittedAt: '2026-06-20T09:12:00', score: 8.0 },
    { id: 'r10', studentName: 'Santiago Flores Mora', submittedAt: '2026-06-20T09:29:00', score: 7.5 },
  ],
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Redondea a un decimal y normaliza -0 → 0. */
function round1(n: number): number {
  return Math.round(n * 10) / 10 || 0
}

interface ExamResultsViewProps {
  /** Inyectable para test/storybook; por defecto usa los resultados simulados. */
  data?: ExamResultsSummary
}

/**
 * Panel de resultados de un examen para el docente.
 *
 * Analítica limpia: KPIs rápidos arriba + tabla de calificaciones abajo.
 * Sin gráficas complejas; foco en los datos duros para asentar promedios.
 */
export function ExamResultsView({ data = MOCK_RESULTS }: ExamResultsViewProps) {
  const { examTitle, subject, maxScore, passingScore, results } = data

  const stats = useMemo(() => {
    const total = results.length
    const sum = results.reduce((acc, r) => acc + r.score, 0)
    const average = total > 0 ? sum / total : 0
    const passed = results.filter((r) => r.score >= passingScore).length
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0
    return { total, average, passed, passRate }
  }, [results, passingScore])

  return (
    <div className="grid gap-8">
      {/* ── Encabezado ── */}
      <header>
        <h1 className="font-nunito text-3xl font-extrabold text-secondary">
          Resultados de la Evaluación
        </h1>
        <p className="font-inter mt-1 text-secondary/60">
          Calificaciones generadas automáticamente tras la aplicación del examen.
        </p>
      </header>

      {/* ── Sección superior: KPIs rápidos ── */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<FileTextIcon className="size-5" />}
          label="Examen"
          value={examTitle}
          hint={subject}
          emphasizeValue={false}
        />
        <KpiCard
          icon={<UsersIcon className="size-5" />}
          label="Alumnos evaluados"
          value={String(stats.total)}
        />
        <KpiCard
          icon={<GaugeIcon className="size-5" />}
          label="Promedio general"
          value={`${round1(stats.average)} / ${maxScore}`}
        />
        <KpiCard
          icon={<AwardIcon className="size-5" />}
          label="Tasa de aprobación"
          value={`${stats.passRate}%`}
          hint={`${stats.passed} de ${stats.total} aprobados`}
        />
      </section>

      {/* ── Sección inferior: tabla de calificaciones ── */}
      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-nunito text-xl font-bold text-secondary">Calificaciones</h2>
          <span className="font-inter text-sm text-secondary/50">
            Aprobatoria mínima: {passingScore} / {maxScore}
          </span>
        </div>

        <Card className="overflow-hidden p-0 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="font-inter border-b border-secondary/10 bg-secondary/[0.03] text-xs font-semibold uppercase tracking-wide text-secondary/50">
                  <th className="px-6 py-3">Alumno</th>
                  <th className="px-6 py-3">Entrega</th>
                  <th className="px-6 py-3 text-right">Puntaje</th>
                  <th className="px-6 py-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="font-inter">
                {results.map((result) => {
                  const passed = result.score >= passingScore
                  return (
                    <tr
                      key={result.id}
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
                        <span className="font-inter text-sm text-secondary/40">
                          {' '}
                          / {maxScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <GradeBadge passed={passed} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────
 * Subcomponentes
 * ─────────────────────────────────────────────────────────── */

interface KpiCardProps {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
  /** Si true, el valor usa número grande en Azul Pizarra; si false, texto compacto. */
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

function GradeBadge({ passed }: { passed: boolean }) {
  return passed ? (
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
