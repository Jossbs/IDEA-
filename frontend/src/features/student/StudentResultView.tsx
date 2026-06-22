import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import { CheckIcon, ClockIcon, XIcon } from '@/design-system/icons'
import { ApiError } from '@/lib/apiClient'
import { cn } from '@/lib/cn'
import { useMyResult } from './api'
import type { StudentAnswerReview } from './types'

/** Student screen to review their graded attempt: which answers were right/wrong. */
export function StudentResultView() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useMyResult(examId)

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-secondary">Mis respuestas</h1>
          <p className="font-inter mt-1 text-secondary/70">
            {data ? data.examTitle : 'Revisa tu examen calificado.'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/')}>
          ← Volver a mis exámenes
        </Button>
      </header>

      {isLoading ? (
        <Card className="font-inter text-secondary/70 shadow-sm">Cargando tu examen…</Card>
      ) : isError || !data ? (
        <Card className="font-inter text-danger shadow-sm">
          {error instanceof ApiError && error.status === 404
            ? 'Aún no has presentado este examen.'
            : `No se pudo cargar tu examen${error instanceof ApiError ? `: ${error.message}` : '.'}`}
        </Card>
      ) : (
        <>
          {/* Score summary */}
          <Card className="flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="font-inter text-sm text-secondary/60">
                {data.status === 'PENDING_REVIEW' ? 'Puntaje parcial (en revisión)' : 'Tu calificación'}
              </p>
              <p className="font-nunito text-3xl font-extrabold tabular-nums text-primary">
                {data.score} <span className="text-lg text-secondary/40">/ {data.maxScore}</span>
              </p>
            </div>
            {data.status === 'PENDING_REVIEW' && (
              <span className="font-inter inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-2 text-sm font-semibold text-accent">
                <ClockIcon className="size-4" />
                Tu docente aún revisa las respuestas abiertas
              </span>
            )}
          </Card>

          <section className="grid gap-4">
            {data.questions.map((q, index) => (
              <AnswerReviewCard key={q.questionId} item={q} index={index} />
            ))}
          </section>
        </>
      )}
    </div>
  )
}

function AnswerReviewCard({ item, index }: { item: StudentAnswerReview; index: number }) {
  return (
    <Card className="shadow-sm">
      <div className="grid gap-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-nunito text-lg font-bold text-secondary">
            {index + 1}. {item.questionText}
          </h3>
          <ResultBadge item={item} />
        </div>

        {item.autoGraded ? (
          <ul className="grid gap-2">
            {item.options.map((opt) => {
              // Highlight: correct answers in green, the student's wrong picks in red.
              const wrongPick = opt.selected && !opt.correct
              return (
                <li
                  key={opt.optionId}
                  className={cn(
                    'font-inter flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm',
                    opt.correct
                      ? 'border-success/40 bg-success/10 text-secondary'
                      : wrongPick
                        ? 'border-danger/40 bg-danger/10 text-secondary'
                        : 'border-secondary/15 bg-white text-secondary/80',
                  )}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    {opt.correct ? (
                      <CheckIcon className="size-4 text-success" />
                    ) : wrongPick ? (
                      <XIcon className="size-4 text-danger" />
                    ) : null}
                  </span>
                  <span className={cn(opt.selected && 'font-semibold')}>{opt.optionText}</span>
                  {opt.selected && (
                    <span className="font-inter ml-auto text-xs text-secondary/50">Tu respuesta</span>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="rounded-lg bg-secondary/5 px-4 py-3">
            <p className="font-inter text-xs font-semibold uppercase tracking-wide text-secondary/50">
              Tu respuesta
            </p>
            <p className="font-inter mt-1 whitespace-pre-wrap text-secondary/90">
              {item.answerText?.trim() ? item.answerText : '(sin respuesta)'}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

/** Per-question outcome chip: points earned for auto-graded, "manual" otherwise. */
function ResultBadge({ item }: { item: StudentAnswerReview }) {
  if (!item.autoGraded) {
    return (
      <span className="font-inter shrink-0 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
        Revisión manual
      </span>
    )
  }
  return (
    <span
      className={cn(
        'font-inter shrink-0 rounded-full px-3 py-1 text-xs font-semibold tabular-nums',
        item.correct ? 'bg-success/20 text-success' : 'bg-danger/15 text-danger',
      )}
    >
      {item.awardedPoints ?? 0} / {item.points} pts
    </span>
  )
}
