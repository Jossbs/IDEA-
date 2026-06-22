import { useEffect, useState } from 'react'
import { Button } from '@/design-system/components/Button'
import {
  CheckCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
} from '@/design-system/icons'
import { cn } from '@/lib/cn'

/* ───────────────────────────────────────────────────────────
 * Tipos (vista del estudiante)
 *
 * SEGURIDAD: a diferencia de `ExamOption` en `types.ts`, esta `StudentOption`
 * NO contiene `isCorrect`. El backend debe limpiar ese campo antes de enviar el
 * examen al alumno para que la respuesta correcta no sea visible inspeccionando
 * la red ni el código. Mantener el tipo separado evita filtrarla por accidente.
 * ─────────────────────────────────────────────────────────── */
export interface StudentOption {
  id: string
  text: string
}

export interface StudentQuestion {
  id: string
  text: string
  options: StudentOption[]
}

export interface StudentExam {
  id: string
  title: string
  /** Duración total en minutos. `null` ⇒ examen sin límite de tiempo. */
  durationMinutes: number | null
  questions: StudentQuestion[]
}

/** Mapa respuesta del alumno: question_id → selected_option_id. */
type AnswerMap = Record<string, string>

/* ───────────────────────────────────────────────────────────
 * Datos simulados (mock) para previsualizar el diseño y la navegación.
 * Se reemplazará por el GET del examen publicado cuando exista el endpoint.
 * ─────────────────────────────────────────────────────────── */
const MOCK_EXAM: StudentExam = {
  id: 'exam-1',
  title: 'Examen Parcial 1 — Cinemática',
  durationMinutes: 20,
  questions: [
    {
      id: 'q1',
      text: '¿Qué magnitud describe el cambio de posición de un objeto respecto al tiempo?',
      options: [
        { id: 'q1-a', text: 'La aceleración' },
        { id: 'q1-b', text: 'La velocidad' },
        { id: 'q1-c', text: 'La masa' },
        { id: 'q1-d', text: 'La fuerza' },
      ],
    },
    {
      id: 'q2',
      text: 'Si un cuerpo se mueve con velocidad constante, ¿cuál es el valor de su aceleración?',
      options: [
        { id: 'q2-a', text: 'Igual a la velocidad' },
        { id: 'q2-b', text: 'Constante y positiva' },
        { id: 'q2-c', text: 'Cero' },
        { id: 'q2-d', text: 'Depende de la masa del cuerpo' },
      ],
    },
    {
      id: 'q3',
      text: 'En el Sistema Internacional, ¿cuál es la unidad de la aceleración?',
      options: [
        { id: 'q3-a', text: 'Metros por segundo (m/s)' },
        { id: 'q3-b', text: 'Metros por segundo al cuadrado (m/s²)' },
        { id: 'q3-c', text: 'Newtons (N)' },
        { id: 'q3-d', text: 'Joules (J)' },
      ],
    },
    {
      id: 'q4',
      text: 'Un automóvil parte del reposo y alcanza 20 m/s en 4 s. ¿Cuál es su aceleración media?',
      options: [
        { id: 'q4-a', text: '4 m/s²' },
        { id: 'q4-b', text: '5 m/s²' },
        { id: 'q4-c', text: '16 m/s²' },
        { id: 'q4-d', text: '80 m/s²' },
      ],
    },
    {
      id: 'q5',
      text: '¿Cuál de las siguientes afirmaciones describe un movimiento rectilíneo uniforme (MRU)?',
      options: [
        { id: 'q5-a', text: 'La velocidad cambia de forma constante' },
        { id: 'q5-b', text: 'La trayectoria es una recta y la velocidad es constante' },
        { id: 'q5-c', text: 'El objeto describe una circunferencia' },
        { id: 'q5-d', text: 'La aceleración aumenta con el tiempo' },
      ],
    },
  ],
}

/** Formatea segundos restantes como mm:ss. */
function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/** Etiqueta de opción: 0 → A, 1 → B, … */
function optionLabel(index: number): string {
  return String.fromCharCode(65 + index)
}

interface StudentExamViewProps {
  /** Inyectable para test/storybook; por defecto usa el examen simulado. */
  exam?: StudentExam
  /** Callback al enviar (se conectará al POST de respuestas más adelante). */
  onSubmit?: (answers: AnswerMap) => void
}

/**
 * Vista de resolución del examen para el estudiante.
 *
 * Entorno libre de distracciones: ocupa toda la pantalla, sin sidebar ni navbar
 * (se monta como ruta de nivel superior, fuera de `AppLayout`). El foco está
 * 100% en la pregunta actual, una a la vez (paginación por pregunta).
 */
export function StudentExamView({ exam = MOCK_EXAM, onSubmit }: StudentExamViewProps) {
  const { title, questions, durationMinutes } = exam
  const total = questions.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [submitted, setSubmitted] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
    durationMinutes != null ? durationMinutes * 60 : null,
  )

  const currentQuestion = questions[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1
  const answeredCount = Object.keys(answers).length
  const progressPct = Math.round(((currentIndex + 1) / total) * 100)

  /** Temporizador descendente; auto-envía al llegar a 0. */
  useEffect(() => {
    if (remainingSeconds == null || submitted) return
    if (remainingSeconds <= 0) {
      setSubmitted(true)
      return
    }
    const id = window.setTimeout(() => {
      setRemainingSeconds((s) => (s == null ? s : s - 1))
    }, 1000)
    return () => window.clearTimeout(id)
  }, [remainingSeconds, submitted])

  function selectOption(questionId: string, optionId: string): void {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  function goPrev(): void {
    setCurrentIndex((i) => Math.max(0, i - 1))
  }

  function goNext(): void {
    setCurrentIndex((i) => Math.min(total - 1, i + 1))
  }

  function handleSubmit(): void {
    setSubmitted(true)
    onSubmit?.(answers)
  }

  const timerIsUrgent = remainingSeconds != null && remainingSeconds <= 60

  /* ── Pantalla de confirmación tras enviar ── */
  if (submitted) {
    return <SubmissionScreen title={title} answeredCount={answeredCount} total={total} />
  }

  return (
    <main className="flex min-h-screen flex-col bg-base">
      {/* ── Cabecera minimalista ── */}
      <header className="border-b border-secondary/10 bg-base/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <h1 className="font-nunito truncate text-lg font-extrabold text-secondary">{title}</h1>

          <div className="flex items-center gap-4">
            <span className="font-nunito text-sm font-bold text-secondary/70">
              Pregunta {currentIndex + 1} de {total}
            </span>

            {remainingSeconds != null && (
              <span
                className={cn(
                  'font-nunito inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold tabular-nums transition-colors',
                  timerIsUrgent
                    ? 'bg-danger/10 text-danger'
                    : 'bg-secondary/5 text-secondary/70',
                )}
              >
                <ClockIcon className="size-4" />
                {formatTime(remainingSeconds)}
              </span>
            )}
          </div>
        </div>

        {/* Barra de progreso sutil */}
        <div className="h-1 w-full bg-secondary/10">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* ── Cuerpo central: una sola pregunta ── */}
      <div className="flex flex-1 items-start justify-center px-6 py-10">
        <section className="w-full max-w-3xl rounded-xl bg-white p-8 shadow-md sm:p-10">
          <p className="font-nunito text-xs font-bold uppercase tracking-wide text-accent">
            Pregunta {currentIndex + 1}
          </p>
          <h2 className="font-nunito mt-2 text-2xl font-bold leading-snug text-secondary sm:text-3xl">
            {currentQuestion.text}
          </h2>

          <ul className="mt-8 grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const selected = answers[currentQuestion.id] === option.id
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => selectOption(currentQuestion.id, option.id)}
                    aria-pressed={selected}
                    className={cn(
                      'group flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'border-secondary/15 bg-white hover:border-primary/40 hover:bg-secondary/[0.02]',
                    )}
                  >
                    {/* Insignia con la letra de la opción */}
                    <span
                      className={cn(
                        'font-nunito flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors',
                        selected
                          ? 'border-primary bg-primary text-white'
                          : 'border-secondary/20 bg-secondary/5 text-secondary/70 group-hover:border-primary/40',
                      )}
                    >
                      {selected ? <CheckIcon className="size-4" /> : optionLabel(index)}
                    </span>

                    <span
                      className={cn(
                        'font-inter text-base',
                        selected ? 'font-medium text-secondary' : 'text-secondary/80',
                      )}
                    >
                      {option.text}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      {/* ── Navegación inferior ── */}
      <footer className="border-t border-secondary/10 bg-base/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <Button variant="ghost" onClick={goPrev} disabled={isFirst}>
            <ChevronLeftIcon className="size-5" />
            Anterior
          </Button>

          <span className="font-inter hidden text-sm text-secondary/50 sm:block">
            {answeredCount} de {total} respondidas
          </span>

          {isLast ? (
            <Button variant="accent" onClick={handleSubmit}>
              <CheckCircleIcon className="size-5" />
              Finalizar y Enviar Examen
            </Button>
          ) : (
            <Button variant="ghost" onClick={goNext}>
              Siguiente
              <ChevronRightIcon className="size-5" />
            </Button>
          )}
        </div>
      </footer>
    </main>
  )
}

/** Pantalla de agradecimiento mostrada una vez enviado el examen. */
function SubmissionScreen({
  title,
  answeredCount,
  total,
}: {
  title: string
  answeredCount: number
  total: number
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-6">
      <section className="w-full max-w-md rounded-xl bg-white p-10 text-center shadow-md">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircleIcon className="size-8" />
        </span>
        <h1 className="font-nunito mt-6 text-2xl font-extrabold text-secondary">
          ¡Examen enviado!
        </h1>
        <p className="font-inter mt-2 text-secondary/70">
          Tus respuestas de <span className="font-semibold">«{title}»</span> se registraron
          correctamente.
        </p>
        <p className="font-inter mt-4 rounded-lg bg-secondary/5 px-4 py-3 text-sm text-secondary/70">
          Respondiste <span className="font-bold text-secondary">{answeredCount}</span> de{' '}
          <span className="font-bold text-secondary">{total}</span> preguntas.
        </p>
      </section>
    </main>
  )
}
