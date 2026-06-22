import { useState } from 'react'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import { SelectField, TextField } from '@/design-system/components/Field'
import { useSubjects } from '@/features/subjects/api'
import { ACADEMIC_LEVEL_LABELS } from '@/features/subjects/types'
import { cn } from '@/lib/cn'
import { QuestionCard } from './components/QuestionCard'
import { createExamDraft, createOption, createQuestion, MIN_OPTIONS } from './types'
import type { DifficultyLevel, ExamDraft } from './types'

type Feedback = { type: 'success' | 'error'; message: string }

/** Teacher-facing screen to author a full exam (general config + reactivos). */
export function CreateExamView() {
  const [exam, setExam] = useState<ExamDraft>(createExamDraft)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const { data: subjects, isLoading: subjectsLoading } = useSubjects(false)

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
  function setDifficulty(questionId: string, difficulty: DifficultyLevel) {
    mapQuestion(questionId, (q) => ({ ...q, difficulty }))
  }
  function addOption(questionId: string) {
    mapQuestion(questionId, (q) => ({ ...q, options: [...q.options, createOption()] }))
  }
  function removeOption(questionId: string, optionId: string) {
    mapQuestion(questionId, (q) => {
      const options = q.options.filter((o) => o.id !== optionId)
      // Keep exactly one correct option after a removal.
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
  function markCorrect(questionId: string, optionId: string) {
    mapQuestion(questionId, (q) => ({
      ...q,
      options: q.options.map((o) => ({ ...o, isCorrect: o.id === optionId })),
    }))
  }

  function validate(): string | null {
    if (!exam.title.trim()) return 'El título del examen es obligatorio.'
    if (!exam.subjectId) return 'Selecciona la materia.'
    if (exam.questions.length === 0) return 'Agrega al menos una pregunta.'
    for (const [i, q] of exam.questions.entries()) {
      const n = i + 1
      if (!q.text.trim()) return `La pregunta ${n} no tiene enunciado.`
      if (q.options.length < MIN_OPTIONS) return `La pregunta ${n} necesita al menos ${MIN_OPTIONS} opciones.`
      if (q.options.some((o) => !o.text.trim())) return `La pregunta ${n} tiene opciones vacías.`
      if (!q.options.some((o) => o.isCorrect)) return `Marca la respuesta correcta de la pregunta ${n}.`
    }
    return null
  }

  function handleSave() {
    const error = validate()
    if (error) {
      setFeedback({ type: 'error', message: error })
      return
    }
    // No backend yet — surface the structured payload for now.
    console.log('Exam draft:', exam)
    setFeedback({
      type: 'success',
      message: exam.isPublished
        ? 'Examen válido y listo para publicar (guardado local; backend pendiente).'
        : 'Borrador válido y guardado localmente (backend pendiente).',
    })
  }

  return (
    <div className="grid gap-8 pb-28">
      <header>
        <h1 className="font-nunito text-3xl font-extrabold text-secondary">Crear examen</h1>
        <p className="font-inter mt-1 text-secondary/60">
          Estructura el examen y agrega tus reactivos manualmente.
        </p>
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

          <label className="font-inter flex w-fit items-center gap-2 text-sm text-secondary/70">
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
        <Button variant="accent" size="lg" onClick={handleSave} className="shadow-lg">
          Guardar Examen Completo
        </Button>
      </div>
    </div>
  )
}
