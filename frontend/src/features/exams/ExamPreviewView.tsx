import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import { CheckIcon } from '@/design-system/icons'
import { ApiError } from '@/lib/apiClient'
import { cn } from '@/lib/cn'
import { useExam } from './api'
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from './types'
import type { QuestionDetail } from './types'

/** Formats an ISO date-time for the deadline chip. */
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Read-only preview of an exam as authored (correct answers highlighted). */
export function ExamPreviewView() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const { data: exam, isLoading, isError, error } = useExam(examId)

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-main">Previsualización</h1>
          <p className="font-inter mt-1 text-muted">
            Así se ve el examen; las respuestas correctas están resaltadas.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/exams')}>
          ← Volver a Mis Evaluaciones
        </Button>
      </header>

      {isLoading ? (
        <Card className="font-inter text-muted shadow-sm">Cargando examen…</Card>
      ) : isError || !exam ? (
        <Card className="font-inter text-danger-text shadow-sm">
          No se pudo cargar el examen
          {error instanceof ApiError ? `: ${error.message}` : '.'}
        </Card>
      ) : (
        <>
          <Card className="shadow-sm">
            <div className="grid gap-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-main">{exam.title}</h2>
                <span
                  className={cn(
                    'font-inter rounded-full px-3 py-1 text-xs font-semibold',
                    exam.published
                      ? 'bg-success-bg text-success-text'
                      : 'bg-main/10 text-muted',
                  )}
                >
                  {exam.published ? 'Publicado' : 'Borrador'}
                </span>
              </div>
              <p className="font-inter text-sm text-muted">
                {exam.subjectName} · {exam.questions.length} preguntas
              </p>
              <div className="font-inter mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                  Vale {exam.totalPoints} {exam.totalPoints === 1 ? 'punto' : 'puntos'}
                </span>
                <span className="rounded-full bg-success-bg px-2.5 py-1 font-medium text-success-text">
                  Acredita con {exam.passingScore} / {exam.totalPoints}
                </span>
                {exam.dueAt && (
                  <span className="rounded-full bg-accent/15 px-2.5 py-1 font-medium text-accent">
                    Entrega: {formatDateTime(exam.dueAt)}
                  </span>
                )}
              </div>
              {exam.description && (
                <p className="font-inter mt-2 text-main">{exam.description}</p>
              )}
            </div>
          </Card>

          <section className="grid gap-4">
            {exam.questions.map((question, index) => (
              <PreviewQuestion key={question.questionId} question={question} index={index} />
            ))}
          </section>
        </>
      )}
    </div>
  )
}

function PreviewQuestion({ question, index }: { question: QuestionDetail; index: number }) {
  return (
    <Card className="shadow-sm">
      <div className="grid gap-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-main">
            {index + 1}. {question.questionText}
          </h3>
          <span className="font-inter shrink-0 text-sm text-muted">
            {question.points} {question.points === 1 ? 'punto' : 'puntos'}
          </span>
        </div>

        <div className="font-inter flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-main/10 px-2.5 py-1 font-medium text-muted">
            {QUESTION_TYPE_LABELS[question.questionType]}
          </span>
          <span className="rounded-full bg-main/10 px-2.5 py-1 font-medium text-muted">
            Dificultad: {DIFFICULTY_LABELS[question.difficultyLevel]}
          </span>
        </div>

        {question.questionType === 'SHORT_TEXT' ? (
          <p className="font-inter rounded-lg bg-main/5 px-3 py-2 text-sm text-muted">
            Respuesta abierta — se califica manualmente.
          </p>
        ) : (
          <ul className="grid gap-2">
            {question.options.map((option) => (
              <li
                key={option.optionId}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2',
                  option.isCorrect
                    ? 'border-success/40 bg-success-bg'
                    : 'border-subtle bg-surface',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs',
                    option.isCorrect
                      ? 'border-success bg-success text-white'
                      : 'border-subtle text-transparent',
                  )}
                >
                  <CheckIcon className="size-3.5" />
                </span>
                <span
                  className={cn(
                    'font-inter text-sm',
                    option.isCorrect ? 'font-medium text-main' : 'text-main',
                  )}
                >
                  {option.optionText}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
