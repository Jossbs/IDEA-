import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import { SelectField, TextField } from '@/design-system/components/Field'
import { useSubjects } from '@/features/subjects/api'
import { ACADEMIC_LEVEL_LABELS } from '@/features/subjects/types'
import { ApiError } from '@/lib/apiClient'
import { cn } from '@/lib/cn'
import { useCreateExam, useExam, useStudents, useUpdateExam } from './api'
import { QuestionCard } from './components/QuestionCard'
import { StudentMultiSelect } from './components/StudentMultiSelect'
import {
  createExamDraft,
  createOption,
  createQuestion,
  detailToDraft,
  hasEditableOptions,
  hasOptions,
  MIN_OPTIONS,
  optionsForType,
  selectionMode,
  toCreateExamPayload,
} from './types'
import type { DifficultyLevel, ExamDraft, QuestionType } from './types'

type Feedback = { type: 'success' | 'error'; message: string }

/** Teacher-facing screen to author a full exam (general config + reactivos). */
export function CreateExamView() {
  const { examId } = useParams()
  const isEdit = Boolean(examId)

  const [exam, setExam] = useState<ExamDraft>(createExamDraft)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const { data: subjects, isLoading: subjectsLoading } = useSubjects(false)
  const { data: students } = useStudents()
  const { data: detail, isLoading: detailLoading } = useExam(examId)
  const createExam = useCreateExam()
  const updateExam = useUpdateExam(examId)
  const navigate = useNavigate()

  // In edit mode, seed the form from the fetched exam once it arrives.
  useEffect(() => {
    if (isEdit && detail && !hydrated) {
      setExam(detailToDraft(detail))
      setHydrated(true)
    }
  }, [isEdit, detail, hydrated])

  const pending = isEdit ? updateExam.isPending : createExam.isPending

  function patch(changes: Partial<ExamDraft>) {
    setExam((prev) => ({ ...prev, ...changes }))
  }

  // --- question / option mutations (immutable) ---
  function addQuestion() {
    setExam((prev) => ({ ...prev, questions: [...prev.questions, createQuestion()] }))
  }
  function removeQuestion(questionId: string) {
    setExam((prev) => ({ ...prev, questions: prev.questions.filter((q) => q.id !== questionId) }))
  }
  function mapQuestion(questionId: string, fn: (q: ExamDraft['questions'][number]) => ExamDraft['questions'][number]) {
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
        setExam(createExamDraft())
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
    <div className="grid gap-8 pb-28">
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
            Publicar examen (visible para los estudiantes). Si lo dejas sin marcar, queda como borrador.
          </label>
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

      {/* Section B — dynamic reactivo builder */}
      <section className="grid gap-4">
        <h2 className="font-nunito text-xl font-bold text-secondary">Preguntas</h2>

        {exam.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
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

      {/* Fixed primary CTA */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          variant="accent"
          size="lg"
          onClick={handleSave}
          disabled={pending}
          className="shadow-lg"
        >
          {pending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Guardar Examen Completo'}
        </Button>
      </div>
    </div>
  )
}
