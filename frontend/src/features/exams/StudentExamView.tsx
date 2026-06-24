import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import {
  CheckCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/design-system/icons'
import { useStudentExam, useSubmitAttempt } from '@/features/student/api'
import type { AnswerSubmission, AttemptResult, StudentQuestion } from '@/features/student/types'
import { ApiError } from '@/lib/apiClient'
import { cn } from '@/lib/cn'

/** Local answer state per question: chosen option ids and/or free text. */
type Answer = { optionIds: string[]; text: string }
type AnswerMap = Record<string, Answer>

const EMPTY: Answer = { optionIds: [], text: '' }

/** Letter badge for an option: 0 → A, 1 → B, … */
function optionLabel(index: number): string {
  return String.fromCharCode(65 + index)
}

/** Formats an ISO deadline shown at the top of the runner. */
function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isAnswered(a: Answer | undefined): boolean {
  return !!a && (a.optionIds.length > 0 || a.text.trim().length > 0)
}

/**
 * Distraction-free exam runner. Loads the sanitized exam by id, paginates one
 * question at a time, supports the four question types, and submits to grade.
 */
export function StudentExamView() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const { data: exam, isLoading, isError, error } = useStudentExam(examId)
  const submit = useSubmitAttempt(examId)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [result, setResult] = useState<AttemptResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const questions = exam?.questions ?? []
  const total = questions.length
  const answeredCount = useMemo(
    () => questions.filter((q) => isAnswered(answers[q.questionId])).length,
    [questions, answers],
  )

  if (isLoading) {
    return <Centered>Cargando examen…</Centered>
  }
  if (isError || !exam) {
    const msg =
      error instanceof ApiError && error.status === 404
        ? 'Este examen no está disponible.'
        : 'No se pudo cargar el examen.'
    return (
      <Centered>
        <p className="text-danger">{msg}</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </Centered>
    )
  }

  if (result) {
    return (
      <ResultScreen
        result={result}
        title={exam.title}
        onHome={() => navigate('/')}
        onReview={() => navigate(`/exam/${examId}/result`)}
      />
    )
  }

  if (total === 0) {
    return (
      <Centered>
        <p className="text-danger">Este examen no tiene preguntas.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </Centered>
    )
  }

  const question = questions[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1
  const progressPct = Math.round(((currentIndex + 1) / total) * 100)
  const answer = answers[question.questionId] ?? EMPTY

  function update(questionId: string, next: Answer) {
    setAnswers((prev) => ({ ...prev, [questionId]: next }))
  }
  function pickSingle(questionId: string, optionId: string) {
    update(questionId, { optionIds: [optionId], text: '' })
  }
  function toggleMultiple(questionId: string, optionId: string) {
    const current = answers[questionId]?.optionIds ?? []
    const optionIds = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId]
    update(questionId, { optionIds, text: '' })
  }
  function setText(questionId: string, text: string) {
    update(questionId, { optionIds: [], text })
  }

  function handleSubmit() {
    setSubmitError(null)
    const payload: AnswerSubmission[] = questions.map((q) => {
      const a = answers[q.questionId] ?? EMPTY
      return q.questionType === 'SHORT_TEXT'
        ? { questionId: q.questionId, answerText: a.text }
        : { questionId: q.questionId, selectedOptionIds: a.optionIds }
    })
    submit.mutate(payload, {
      onSuccess: setResult,
      onError: (err) =>
        setSubmitError(
          err instanceof ApiError ? err.message : 'No se pudo enviar el examen. Inténtalo de nuevo.',
        ),
    })
  }

  return (
    <main className="flex min-h-screen flex-col bg-app">
      {/* Header */}
      <header className="border-b border-main/10 bg-app/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="min-w-0">
            <h1 className="font-nunito truncate text-lg font-extrabold text-main">
              {exam.title}
            </h1>
            {exam.dueAt && (
              <p className="font-inter mt-0.5 text-xs text-main/60">
                Entrega: {formatDeadline(exam.dueAt)}
              </p>
            )}
          </div>
          <span className="font-nunito text-sm font-bold text-main/70">
            Pregunta {currentIndex + 1} de {total}
          </span>
        </div>
        <div className="h-1 w-full bg-main/10">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* Question body */}
      <div className="flex flex-1 items-start justify-center px-6 py-10">
        <section className="w-full max-w-3xl rounded-xl bg-white p-8 shadow-md sm:p-10">
          <p className="font-nunito text-xs font-bold uppercase tracking-wide text-accent">
            Pregunta {currentIndex + 1}
          </p>
          <h2 className="font-nunito mt-2 text-2xl font-bold leading-snug text-main sm:text-3xl">
            {question.questionText}
          </h2>

          <QuestionInput
            question={question}
            answer={answer}
            onPickSingle={(oid) => pickSingle(question.questionId, oid)}
            onToggleMultiple={(oid) => toggleMultiple(question.questionId, oid)}
            onSetText={(t) => setText(question.questionId, t)}
          />
        </section>
      </div>

      {/* Footer nav */}
      <footer className="border-t border-main/10 bg-app/80 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-3xl px-6 py-4">
          {submitError && (
            <p role="alert" className="font-inter mb-3 text-center text-sm text-danger">
              {submitError}
            </p>
          )}
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={isFirst}>
              <ChevronLeftIcon className="size-5" />
              Anterior
            </Button>

            <span className="font-inter hidden text-sm text-main/60 sm:block">
              {answeredCount} de {total} respondidas
            </span>

            {isLast ? (
              <Button variant="accent" onClick={handleSubmit} disabled={submit.isPending}>
                <CheckCircleIcon className="size-5" />
                {submit.isPending ? 'Enviando…' : 'Finalizar y enviar'}
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}>
                Siguiente
                <ChevronRightIcon className="size-5" />
              </Button>
            )}
          </div>
        </div>
      </footer>
    </main>
  )
}

/** Renders the right input for the question type. */
function QuestionInput({
  question,
  answer,
  onPickSingle,
  onToggleMultiple,
  onSetText,
}: {
  question: StudentQuestion
  answer: Answer
  onPickSingle: (optionId: string) => void
  onToggleMultiple: (optionId: string) => void
  onSetText: (text: string) => void
}) {
  if (question.questionType === 'SHORT_TEXT') {
    return (
      <textarea
        value={answer.text}
        onChange={(e) => onSetText(e.target.value)}
        placeholder="Escribe tu respuesta…"
        rows={5}
        className="font-inter mt-8 w-full resize-y rounded-lg border border-main/20 bg-white px-4 py-3 text-main placeholder:text-main/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-white"
      />
    )
  }

  const multiple = question.questionType === 'MULTIPLE_CHOICE'

  return (
    <>
      {multiple && (
        <p className="font-inter mt-3 text-sm text-main/60">Elige una o varias opciones.</p>
      )}
      <ul className="mt-8 grid gap-3">
        {question.options.map((option, index) => {
          const selected = answer.optionIds.includes(option.optionId)
          return (
            <li key={option.optionId}>
              <button
                type="button"
                onClick={() =>
                  multiple ? onToggleMultiple(option.optionId) : onPickSingle(option.optionId)
                }
                aria-pressed={selected}
                className={cn(
                  'group flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'border-main/15 bg-white hover:border-primary/40 hover:bg-main/[0.02]',
                )}
              >
                <span
                  className={cn(
                    'font-nunito flex size-9 shrink-0 items-center justify-center border text-sm font-bold transition-colors',
                    multiple ? 'rounded-md' : 'rounded-full',
                    selected
                      ? 'border-primary bg-primary text-white'
                      : 'border-main/20 bg-main/5 text-main/70 group-hover:border-primary/40',
                  )}
                >
                  {selected ? <CheckIcon className="size-4" /> : optionLabel(index)}
                </span>
                <span
                  className={cn(
                    'font-inter text-base',
                    selected ? 'font-medium text-main' : 'text-main/80',
                  )}
                >
                  {option.optionText}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-app px-6 text-center font-inter text-main/70">
      {children}
    </main>
  )
}

/** Post-submission screen with the auto-graded score. */
function ResultScreen({
  result,
  title,
  onHome,
  onReview,
}: {
  result: AttemptResult
  title: string
  onHome: () => void
  onReview: () => void
}) {
  const pending = result.status === 'PENDING_REVIEW'
  const accredited = !pending && result.score >= result.passingScore
  return (
    <main className="flex min-h-screen items-center justify-center bg-app px-6">
      <section className="w-full max-w-md rounded-xl bg-white p-10 text-center shadow-md">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircleIcon className="size-8" />
        </span>
        <h1 className="font-nunito mt-6 text-2xl font-extrabold text-main">¡Examen enviado!</h1>
        <p className="font-inter mt-2 text-main/70">
          Tus respuestas de <span className="font-semibold">«{title}»</span> se registraron
          correctamente.
        </p>

        <div className="mt-6 rounded-lg bg-main/5 px-4 py-4">
          <p className="font-inter text-sm text-main/60">
            {pending ? 'Puntaje automático (parcial)' : 'Tu puntaje'}
          </p>
          <p className="font-nunito mt-1 text-3xl font-extrabold tabular-nums text-primary">
            {result.score} <span className="text-lg text-main/40">/ {result.maxScore}</span>
          </p>
          <p className="font-inter mt-1 text-xs text-main/60">
            Mínimo para acreditar: {result.passingScore}
          </p>
        </div>

        {!pending && (
          <p
            className={cn(
              'font-inter mt-4 rounded-lg px-4 py-2 text-sm font-semibold',
              accredited ? 'bg-success/15 text-success' : 'bg-danger/10 text-danger',
            )}
          >
            {accredited ? '¡Acreditaste el examen! ✓' : 'No alcanzaste el puntaje para acreditar.'}
          </p>
        )}

        {pending && (
          <p className="font-inter mt-4 text-sm text-main/70">
            Algunas preguntas de respuesta abierta serán revisadas por tu docente; tu calificación
            final puede aumentar.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Button variant="accent" onClick={onReview}>
            Ver mis respuestas
          </Button>
          <Button variant="ghost" onClick={onHome}>
            Volver al inicio
          </Button>
        </div>
      </section>
    </main>
  )
}
