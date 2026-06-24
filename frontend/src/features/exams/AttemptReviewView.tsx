import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import { ApiError } from '@/lib/apiClient'
import { useAttemptReview, useSubmitReview } from './api'
import type { AttemptReview } from './types'

/** Teacher screen to grade an attempt's short-text answers and finalize it. */
export function AttemptReviewView() {
  const { examId, attemptId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useAttemptReview(examId, attemptId)

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-main">Revisión manual</h1>
          <p className="font-inter mt-1 text-main/70">
            Califica las respuestas abiertas para completar la calificación.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate(`/exams/${examId}/results`)}>
          ← Volver a Resultados
        </Button>
      </header>

      {isLoading ? (
        <Card className="font-inter text-main/70 shadow-sm">Cargando entrega…</Card>
      ) : isError || !data ? (
        <Card className="font-inter text-danger shadow-sm">
          No se pudo cargar la entrega
          {error instanceof ApiError ? `: ${error.message}` : '.'}
        </Card>
      ) : (
        <ReviewForm
          examId={examId}
          attemptId={attemptId}
          review={data}
          onDone={() => navigate(`/exams/${examId}/results`)}
        />
      )}
    </div>
  )
}

function ReviewForm({
  examId,
  attemptId,
  review,
  onDone,
}: {
  examId: string | undefined
  attemptId: string | undefined
  review: AttemptReview
  onDone: () => void
}) {
  const submit = useSubmitReview(examId, attemptId)
  // Empty string = field cleared (counts as 0); lets the teacher erase the value
  // and type freely instead of fighting a sticky default zero.
  const [grades, setGrades] = useState<Record<string, number | ''>>(() =>
    Object.fromEntries(review.items.map((i) => [i.questionId, ''])),
  )
  const [error, setError] = useState<string | null>(null)

  const manualTotal = useMemo(
    () => Object.values(grades).reduce<number>((acc, n) => acc + (n || 0), 0),
    [grades],
  )
  const finalScore = review.autoScore + manualTotal

  function setPoints(questionId: string, max: number, raw: string) {
    if (raw === '') {
      setGrades((prev) => ({ ...prev, [questionId]: '' }))
      return
    }
    const n = parseInt(raw, 10)
    const clamped = Number.isNaN(n) ? 0 : Math.max(0, Math.min(max, n))
    setGrades((prev) => ({ ...prev, [questionId]: clamped }))
  }

  function handleSubmit() {
    setError(null)
    const payload = review.items.map((i) => ({
      questionId: i.questionId,
      points: grades[i.questionId] || 0,
    }))
    submit.mutate(payload, {
      onSuccess: onDone,
      onError: (err) =>
        setError(err instanceof ApiError ? err.message : 'No se pudo guardar la calificación.'),
    })
  }

  const alreadyGraded = review.status === 'GRADED'

  return (
    <>
      <Card className="flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <p className="font-inter text-sm text-main/60">Alumno</p>
          <p className="font-nunito text-lg font-bold text-main">{review.studentName}</p>
        </div>
        <div className="text-right">
          <p className="font-inter text-sm text-main/60">Calificación con esta revisión</p>
          <p className="font-nunito text-2xl font-extrabold tabular-nums text-primary">
            {finalScore} <span className="text-base text-main/40">/ {review.maxScore}</span>
          </p>
          <p className="font-inter text-xs text-main/50">
            (automático {review.autoScore} + manual {manualTotal})
          </p>
        </div>
      </Card>

      {alreadyGraded && (
        <Card className="font-inter bg-accent/10 text-sm text-main/80 shadow-sm">
          Esta entrega ya fue calificada. Puedes ajustar los puntos y volver a guardar.
        </Card>
      )}

      <section className="grid gap-4">
        {review.items.map((item, index) => (
          <Card key={item.questionId} className="shadow-sm">
            <div className="grid gap-3">
              <h3 className="font-nunito text-lg font-bold text-main">
                {index + 1}. {item.questionText}
              </h3>
              <div className="rounded-lg bg-main/5 px-4 py-3">
                <p className="font-inter text-xs font-semibold uppercase tracking-wide text-main/50">
                  Respuesta del alumno
                </p>
                <p className="font-inter mt-1 whitespace-pre-wrap text-main/90">
                  {item.answerText.trim() ? item.answerText : '(sin respuesta)'}
                </p>
              </div>
              <label className="font-inter flex items-center gap-3 text-sm font-medium text-main/70">
                Puntos otorgados
                <input
                  type="number"
                  min={0}
                  max={item.maxPoints}
                  placeholder="0"
                  value={grades[item.questionId] ?? ''}
                  onChange={(e) => setPoints(item.questionId, item.maxPoints, e.target.value)}
                  className="w-24 rounded-lg border border-main/20 bg-white px-3 py-2 text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
                />
                <span className="text-main/50">/ {item.maxPoints}</span>
              </label>
            </div>
          </Card>
        ))}
      </section>

      {error && (
        <p role="alert" className="font-inter text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button variant="accent" size="lg" onClick={handleSubmit} disabled={submit.isPending}>
          {submit.isPending ? 'Guardando…' : 'Guardar calificación'}
        </Button>
      </div>
    </>
  )
}
