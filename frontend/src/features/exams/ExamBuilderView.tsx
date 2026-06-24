import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import { SelectField, TextField } from '@/design-system/components/Field'
import { CheckCircleIcon } from '@/design-system/icons'
import { useSubjects } from '@/features/subjects/api'
import { ACADEMIC_LEVEL_LABELS } from '@/features/subjects/types'
import { ApiError } from '@/lib/apiClient'
import { cn } from '@/lib/cn'
import { useCreateExam, useExam, useStudents, useUpdateExam } from './api'
import { QuestionAccordion } from './components/QuestionAccordion'
import { StudentMultiSelect } from './components/StudentMultiSelect'
import {
  createExamDraft,
  createOption,
  createQuestion,
  detailToDraft,
  distributedPoints,
  hasEditableOptions,
  hasOptions,
  MIN_OPTIONS,
  optionsForType,
  selectionMode,
  toCreateExamPayload,
} from './types'
import type { DifficultyLevel, ExamDraft, ExamQuestion, QuestionType } from './types'

type Feedback = { type: 'success' | 'error'; message: string }

/**
 * Teacher-facing exam builder. A progressive-disclosure list of question
 * accordions (only the one being edited is expanded) plus a floating sticky
 * action bar so "Guardar" is always reachable without scrolling to the bottom.
 *
 * Drop-in replacement for the long-form `CreateExamView`.
 */
export function ExamBuilderView() {
  const { examId } = useParams()
  const isEdit = Boolean(examId)

  const [exam, setExam] = useState<ExamDraft>(createExamDraft)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [hydrated, setHydrated] = useState(false)
  /** Id of the single expanded question (progressive disclosure). */
  const [expandedId, setExpandedId] = useState<string | null>(
    () => exam.questions[0]?.id ?? null,
  )
  const { data: subjects, isLoading: subjectsLoading } = useSubjects(false)
  const { data: students } = useStudents()
  const { data: detail, isLoading: detailLoading } = useExam(examId)
  const createExam = useCreateExam()
  const updateExam = useUpdateExam(examId)
  const navigate = useNavigate()

  // In edit mode, seed the form from the fetched exam once it arrives.
  useEffect(() => {
    if (isEdit && detail && !hydrated) {
      const draft = detailToDraft(detail)
      setExam(draft)
      setExpandedId(draft.questions[0]?.id ?? null)
      setHydrated(true)
    }
  }, [isEdit, detail, hydrated])

  const pending = isEdit ? updateExam.isPending : createExam.isPending
  const distributed = distributedPoints(exam.questions)

  function patch(changes: Partial<ExamDraft>) {
    setExam((prev) => ({ ...prev, ...changes }))
  }

  // --- question / option mutations (immutable) ---
  function addQuestion() {
    const question = createQuestion()
    setExam((prev) => ({ ...prev, questions: [...prev.questions, question] }))
    setExpandedId(question.id) // jump straight into editing the new one
  }
  function removeQuestion(questionId: string) {
    setExam((prev) => ({ ...prev, questions: prev.questions.filter((q) => q.id !== questionId) }))
    setExpandedId((current) => (current === questionId ? null : current))
  }
  function toggleExpanded(questionId: string) {
    setExpandedId((current) => (current === questionId ? null : questionId))
  }
  function mapQuestion(questionId: string, fn: (q: ExamQuestion) => ExamQuestion) {
    setExam((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? fn(q) : q)),
    }))
  }
  function setQuestionText(questionId: string, text: string) {
    mapQuestion(questionId, (q) => ({ ...q, text }))
  }
  function setPoints(questionId: string, points: number) {
    mapQuestion(questionId, (q) => ({ ...q, points }))
  }
  function setDifficulty(questionId: string, difficulty: DifficultyLevel) {
    mapQuestion(questionId, (q) => ({ ...q, difficulty }))
  }
  /** Switching type re-shapes the options to stay valid for the new type. */
  function setType(questionId: string, type: QuestionType) {
    mapQuestion(questionId, (q) => {
      if (q.type === type) return q
      let options = q.options
      if (type === 'TRUE_FALSE' || type === 'SHORT_TEXT' || !hasEditableOptions(q.type)) {
        // Going to a fixed/no-option type, or coming from one → start fresh.
        options = optionsForType(type)
      } else if (type === 'SINGLE_CHOICE') {
        // Collapse to exactly one correct (the first currently-correct one).
        const firstCorrect = q.options.findIndex((o) => o.isCorrect)
        const keep = firstCorrect < 0 ? 0 : firstCorrect
        options = q.options.map((o, i) => ({ ...o, isCorrect: i === keep }))
      } else if (!q.options.some((o) => o.isCorrect)) {
        // MULTIPLE_CHOICE must still have at least one correct.
        options = q.options.map((o, i) => ({ ...o, isCorrect: i === 0 }))
      }
      return { ...q, type, options }
    })
  }
  function addOption(questionId: string) {
    mapQuestion(questionId, (q) =>
      hasEditableOptions(q.type) ? { ...q, options: [...q.options, createOption()] } : q,
    )
  }
  function removeOption(questionId: string, optionId: string) {
    mapQuestion(questionId, (q) => {
      const options = q.options.filter((o) => o.id !== optionId)
      // Keep at least one correct option after a removal.
      if (options.length > 0 && !options.some((o) => o.isCorrect)) {
        options[0] = { ...options[0], isCorrect: true }
      }
      return { ...q, options }
    })
  }
  function setOptionText(questionId: string, optionId: string, text: string) {
    mapQuestion(questionId, (q) => ({
      ...q,
      options: q.options.map((o) => (o.id === optionId ? { ...o, text } : o)),
    }))
  }
  /** Single-choice / true-false behave as a radio; multiple-choice toggles. */
  function markCorrect(questionId: string, optionId: string) {
    mapQuestion(questionId, (q) => {
      if (selectionMode(q.type) === 'multiple') {
        return {
          ...q,
          options: q.options.map((o) =>
            o.id === optionId ? { ...o, isCorrect: !o.isCorrect } : o,
          ),
        }
      }
      return { ...q, options: q.options.map((o) => ({ ...o, isCorrect: o.id === optionId })) }
    })
  }

  function validate(): string | null {
    if (!exam.title.trim()) return 'El título del examen es obligatorio.'
    if (!exam.subjectId) return 'Selecciona la materia.'
    if (exam.questions.length === 0) return 'Agrega al menos una pregunta.'
    for (const [i, q] of exam.questions.entries()) {
      const n = i + 1
      if (!q.text.trim()) return `La pregunta ${n} no tiene enunciado.`
      if (q.points < 1) return `La pregunta ${n} debe valer al menos 1 punto.`
      // SHORT_TEXT: free-text, graded manually — no option rules.
      if (!hasOptions(q.type)) continue
      if (q.options.length < MIN_OPTIONS) {
        return `La pregunta ${n} necesita al menos ${MIN_OPTIONS} opciones.`
      }
      if (q.options.some((o) => !o.text.trim())) return `La pregunta ${n} tiene opciones vacías.`
      const correct = q.options.filter((o) => o.isCorrect).length
      if (q.type === 'MULTIPLE_CHOICE') {
        if (correct < 1) return `Marca al menos una respuesta correcta en la pregunta ${n}.`
      } else if (correct !== 1) {
        return `Marca exactamente una respuesta correcta en la pregunta ${n}.`
      }
    }
    // Scoring rules: a valid worth, a reachable accreditation threshold, and a
    // distribution that adds up to the declared total.
    if (exam.totalPoints < 1) return 'El puntaje total del examen debe ser al menos 1.'
    if (exam.passingScore < 1) return 'El puntaje de acreditación debe ser al menos 1.'
    if (exam.passingScore > exam.totalPoints) {
      return `El puntaje de acreditación no puede ser mayor que el puntaje total (${exam.totalPoints}).`
    }
    if (distributed !== exam.totalPoints) {
      return `Has distribuido ${distributed} ${distributed === 1 ? 'punto' : 'puntos'} entre las preguntas, pero el examen vale ${exam.totalPoints}. Ajusta los puntos de las preguntas o el puntaje total.`
    }
    return null
  }

  function handleSave() {
    const error = validate()
    if (error) {
      setFeedback({ type: 'error', message: error })
      return
    }
    setFeedback(null)
    const payload = toCreateExamPayload(exam)
    const onError = (err: unknown) =>
      setFeedback({
        type: 'error',
        message:
          err instanceof ApiError
            ? err.message
            : 'No se pudo guardar el examen. Inténtalo de nuevo.',
      })

    if (isEdit) {
      updateExam.mutate(payload, { onSuccess: () => navigate('/exams'), onError })
      return
    }

    const wasPublished = exam.isPublished
    createExam.mutate(payload, {
      onSuccess: () => {
        const fresh = createExamDraft()
        setExam(fresh)
        setExpandedId(fresh.questions[0]?.id ?? null)
        setFeedback({
          type: 'success',
          message: wasPublished
            ? 'Examen creado y publicado correctamente.'
            : 'Borrador guardado correctamente.',
        })
      },
      onError,
    })
  }

  if (isEdit && detailLoading && !hydrated) {
    return (
      <div className="font-inter py-16 text-center text-secondary/70">Cargando examen…</div>
    )
  }

  return (
    <div className="grid gap-8 pb-32">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-secondary">
            {isEdit ? 'Editar examen' : 'Crear examen'}
          </h1>
          <p className="font-inter mt-1 text-secondary/70">
            Estructura el examen y agrega tus reactivos manualmente.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/exams')}>
          ← Volver a Mis Evaluaciones
        </Button>
      </header>

      {/* Section A — general config */}
      <Card className="shadow-sm">
        <div className="grid gap-5">
          <h2 className="font-nunito text-xl font-bold text-secondary">Configuración general</h2>

          <TextField
            label="Título del examen"
            value={exam.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Ej. Examen parcial de Álgebra"
          />

          <SelectField
            label="Materia"
            value={exam.subjectId}
            onChange={(e) => patch({ subjectId: e.target.value })}
          >
            <option value="" disabled>
              {subjectsLoading ? 'Cargando…' : 'Selecciona una materia…'}
            </option>
            {subjects?.map((subject) => (
              <option key={subject.subjectIdentifier} value={subject.subjectIdentifier}>
                {subject.subjectName} - {ACADEMIC_LEVEL_LABELS[subject.academicLevel]}
              </option>
            ))}
          </SelectField>

          <label className="grid gap-1.5">
            <span className="font-inter text-sm font-medium text-secondary/70">
              Descripción (opcional)
            </span>
            <textarea
              value={exam.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Instrucciones generales para el alumno…"
              rows={3}
              className="font-inter w-full resize-y rounded-lg border border-secondary/20 bg-white px-3 py-2 text-secondary placeholder:text-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
            />
          </label>

          <label className="font-inter flex w-fit items-center gap-2 text-sm text-secondary/80">
            <input
              type="checkbox"
              className="size-4 accent-accent"
              checked={exam.isPublished}
              onChange={(e) => patch({ isPublished: e.target.checked })}
            />
            Publicar examen (visible para los estudiantes). Si lo dejas sin marcar, queda como
            borrador.
          </label>
        </div>
      </Card>

      {/* Section A.1 — scoring & delivery */}
      <Card className="shadow-sm">
        <div className="grid gap-5">
          <div>
            <h2 className="font-nunito text-xl font-bold text-secondary">Puntuación y entrega</h2>
            <p className="font-inter mt-1 text-sm text-secondary/70">
              Define cuánto vale el examen, el puntaje mínimo para acreditar y la fecha límite de
              entrega.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Puntaje total del examen"
              type="number"
              min={1}
              value={exam.totalPoints}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                patch({ totalPoints: Number.isNaN(n) ? 0 : n })
              }}
            />
            <TextField
              label="Puntaje para acreditar"
              type="number"
              min={1}
              max={exam.totalPoints || undefined}
              value={exam.passingScore}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                patch({ passingScore: Number.isNaN(n) ? 0 : n })
              }}
            />
            <TextField
              label="Fecha y hora de entrega (opcional)"
              type="datetime-local"
              value={exam.dueAt}
              onChange={(e) => patch({ dueAt: e.target.value })}
            />
          </div>

          <PointsBalance distributed={distributed} total={exam.totalPoints} />
        </div>
      </Card>

      {/* Section A.2 — assign to students */}
      <Card className="shadow-sm">
        <div className="grid gap-3">
          <div>
            <h2 className="font-nunito text-xl font-bold text-secondary">Asignar a alumnos</h2>
            <p className="font-inter mt-1 text-sm text-secondary/70">
              Elige a qué alumnos va dirigido este examen. Puedes dejarlo vacío y asignarlo después.
            </p>
          </div>
          <StudentMultiSelect
            students={students ?? []}
            selectedIds={exam.studentIds}
            onChange={(studentIds) => patch({ studentIds })}
            className="max-h-64"
          />
        </div>
      </Card>

      {/* Section B — progressive-disclosure reactivo builder */}
      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-nunito text-xl font-bold text-secondary">
            Preguntas{' '}
            <span className="font-inter text-base font-medium text-secondary/50">
              ({exam.questions.length})
            </span>
          </h2>
          <PointsTag distributed={distributed} total={exam.totalPoints} />
        </div>

        {exam.questions.map((question, index) => (
          <QuestionAccordion
            key={question.id}
            question={question}
            index={index}
            expanded={expandedId === question.id}
            onToggle={() => toggleExpanded(question.id)}
            canRemove={exam.questions.length > 1}
            onTextChange={(text) => setQuestionText(question.id, text)}
            onTypeChange={(type) => setType(question.id, type)}
            onPointsChange={(points) => setPoints(question.id, points)}
            onDifficultyChange={(difficulty) => setDifficulty(question.id, difficulty)}
            onOptionTextChange={(optionId, text) => setOptionText(question.id, optionId, text)}
            onMarkCorrect={(optionId) => markCorrect(question.id, optionId)}
            onAddOption={() => addOption(question.id)}
            onRemoveOption={(optionId) => removeOption(question.id, optionId)}
            onRemove={() => removeQuestion(question.id)}
          />
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="font-inter w-full rounded-xl border-2 border-dashed border-accent/50 py-4 font-semibold text-accent transition-colors hover:border-accent hover:bg-accent/5"
        >
          + Agregar nueva pregunta
        </button>
      </section>

      {feedback && (
        <div
          role="status"
          className={cn(
            'font-inter rounded-lg px-4 py-3 text-sm',
            feedback.type === 'success' ? 'bg-success/15 text-success' : 'bg-danger/10 text-danger',
          )}
        >
          {feedback.message}
        </div>
      )}

      {/* Floating sticky action bar — Guardar is always one click away. */}
      <div className="pointer-events-none sticky bottom-4 z-20 flex justify-center">
        <div className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-4 rounded-2xl border border-secondary/10 bg-surface/90 px-5 py-3 shadow-lg backdrop-blur-sm">
          <span
            className={cn(
              'font-inter flex items-center gap-2 text-sm font-semibold tabular-nums',
              distributed === exam.totalPoints ? 'text-success' : 'text-accent',
            )}
          >
            {distributed === exam.totalPoints && <CheckCircleIcon className="size-4" />}
            {distributed} / {exam.totalPoints} pts
          </span>
          <Button variant="accent" size="lg" onClick={handleSave} disabled={pending}>
            {pending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Guardar Examen Completo'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Full-width feedback on whether the distributed points match the declared total. */
function PointsBalance({ distributed, total }: { distributed: number; total: number }) {
  const balanced = distributed === total
  const remaining = total - distributed
  return (
    <div
      className={cn(
        'font-inter flex flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm',
        balanced ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent',
      )}
    >
      <span className="font-semibold">
        Puntos distribuidos: {distributed} / {total}
      </span>
      <span>
        {balanced
          ? 'La distribución coincide con el puntaje total. ✓'
          : remaining > 0
            ? `Faltan ${remaining} ${remaining === 1 ? 'punto' : 'puntos'} por asignar.`
            : `Te excediste por ${-remaining} ${-remaining === 1 ? 'punto' : 'puntos'}.`}
      </span>
    </div>
  )
}

/** Compact chip mirroring the distribution balance next to the questions header. */
function PointsTag({ distributed, total }: { distributed: number; total: number }) {
  const balanced = distributed === total
  return (
    <span
      className={cn(
        'font-inter rounded-full px-3 py-1 text-xs font-semibold tabular-nums',
        balanced ? 'bg-success/20 text-success' : 'bg-accent/15 text-accent',
      )}
    >
      {distributed} / {total} pts
    </span>
  )
}
