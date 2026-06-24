import { Card } from '@/design-system/components/Card'
import { SelectField, TextField } from '@/design-system/components/Field'
import { TrashIcon } from '@/design-system/icons'
import { cn } from '@/lib/cn'
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_LEVELS,
  hasEditableOptions,
  hasOptions,
  MIN_OPTIONS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
  selectionMode,
} from '../types'
import type { DifficultyLevel, ExamQuestion, QuestionType } from '../types'
import { OptionRow } from './OptionRow'

type QuestionCardProps = {
  question: ExamQuestion
  index: number
  /** False for the last remaining question, so the exam always has at least one. */
  canRemove: boolean
  onTextChange: (text: string) => void
  onTypeChange: (type: QuestionType) => void
  onPointsChange: (points: number) => void
  onDifficultyChange: (difficulty: DifficultyLevel) => void
  onOptionTextChange: (optionId: string, text: string) => void
  onMarkCorrect: (optionId: string) => void
  onAddOption: () => void
  onRemoveOption: (optionId: string) => void
  onRemove: () => void
}

/** Color-coded styles for the selected difficulty pill. */
const difficultyActive: Record<DifficultyLevel, string> = {
  LOW: 'bg-success text-white border-success',
  MEDIUM: 'bg-accent text-white border-accent',
  HIGH: 'bg-danger text-white border-danger',
}

/** Self-contained card for authoring one question and its options. */
export function QuestionCard({
  question,
  index,
  canRemove,
  onTextChange,
  onTypeChange,
  onPointsChange,
  onDifficultyChange,
  onOptionTextChange,
  onMarkCorrect,
  onAddOption,
  onRemoveOption,
  onRemove,
}: QuestionCardProps) {
  const mode = selectionMode(question.type)
  const editableOptions = hasEditableOptions(question.type)
  const canRemoveOption = editableOptions && question.options.length > MIN_OPTIONS

  return (
    <Card className="shadow-sm">
      <div className="grid gap-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-main">Pregunta {index + 1}</h3>
          <button
            type="button"
            onClick={onRemove}
            disabled={!canRemove}
            aria-label={`Eliminar pregunta ${index + 1}`}
            title="Eliminar pregunta"
            className="text-muted transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-muted"
          >
            <TrashIcon />
          </button>
        </div>

        <textarea
          value={question.text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Escribe el enunciado de la pregunta…"
          rows={2}
          className="font-inter w-full resize-y rounded-lg border border-subtle bg-surface px-3 py-2 text-main placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
        />

        {/* Type + points */}
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <SelectField
            label="Tipo de respuesta"
            value={question.type}
            onChange={(e) => onTypeChange(e.target.value as QuestionType)}
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {QUESTION_TYPE_LABELS[type]}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Puntos"
            type="number"
            min={1}
            value={question.points}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10)
              onPointsChange(Number.isNaN(n) || n < 1 ? 1 : n)
            }}
          />
        </div>

        {/* Difficulty — color-coded segmented control */}
        <div className="flex items-center gap-3">
          <span className="font-inter text-sm font-medium text-muted">Dificultad</span>
          <div className="flex gap-2">
            {DIFFICULTY_LEVELS.map((level) => {
              const active = question.difficulty === level
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onDifficultyChange(level)}
                  aria-pressed={active}
                  className={cn(
                    'font-inter rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                    active
                      ? difficultyActive[level]
                      : 'border-subtle text-main hover:border-subtle',
                  )}
                >
                  {DIFFICULTY_LABELS[level]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Options — depends on the question type */}
        {hasOptions(question.type) ? (
          <div className="grid gap-2">
            <span className="font-inter text-sm font-medium text-muted">
              {mode === 'multiple' ? 'Opciones (marca las correctas)' : 'Opciones (marca la correcta)'}
            </span>
            {question.options.map((option, i) => (
              <OptionRow
                key={option.id}
                option={option}
                index={i}
                groupName={question.id}
                mode={mode}
                editableText={editableOptions}
                canRemove={canRemoveOption}
                onTextChange={(text) => onOptionTextChange(option.id, text)}
                onMarkCorrect={() => onMarkCorrect(option.id)}
                onRemove={() => onRemoveOption(option.id)}
              />
            ))}

            {editableOptions && (
              <button
                type="button"
                onClick={onAddOption}
                className="font-inter inline-flex w-fit items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
              >
                + Agregar opción
              </button>
            )}
          </div>
        ) : (
          <p className="font-inter rounded-lg bg-main/5 px-3 py-2 text-sm text-muted">
            El alumno responde en texto libre. Esta pregunta se calificará manualmente.
          </p>
        )}
      </div>
    </Card>
  )
}
