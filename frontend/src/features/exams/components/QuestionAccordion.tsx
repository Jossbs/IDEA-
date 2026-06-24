import { SelectField, TextField } from '@/design-system/components/Field'
import { ChevronRightIcon, TrashIcon } from '@/design-system/icons'
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

type QuestionAccordionProps = {
  question: ExamQuestion
  index: number
  /** Only one card is expanded at a time (progressive disclosure). */
  expanded: boolean
  onToggle: () => void
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

/** Soft tint for the difficulty chip shown in the collapsed summary. */
const difficultyChip: Record<DifficultyLevel, string> = {
  LOW: 'bg-success/15 text-success',
  MEDIUM: 'bg-accent/15 text-accent',
  HIGH: 'bg-danger/10 text-danger',
}

/** Shared subtle icon-button: warm-gray hover, slate-blue icon. */
const iconButton =
  'inline-flex size-8 items-center justify-center rounded-lg text-secondary/50 transition-colors ' +
  'hover:bg-secondary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 ' +
  'disabled:hover:bg-transparent disabled:hover:text-secondary/50'

/**
 * Progressive-disclosure question editor. Collapsed, it shows a compact one-line
 * summary; expanded, it reveals the full editor. Replaces the always-open
 * `QuestionCard` to keep long exams scannable.
 */
export function QuestionAccordion({
  question,
  index,
  expanded,
  onToggle,
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
}: QuestionAccordionProps) {
  const mode = selectionMode(question.type)
  const editableOptions = hasEditableOptions(question.type)
  const canRemoveOption = editableOptions && question.options.length > MIN_OPTIONS
  const correctCount = question.options.filter((o) => o.isCorrect).length
  const summary = question.text.trim() || 'Pregunta sin enunciado'

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-surface shadow-card transition-all duration-200',
        expanded ? 'border-primary/30 ring-1 ring-primary/10' : 'border-secondary/10',
      )}
    >
      {/* Header — always visible, toggles the body. */}
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <ChevronRightIcon
            className={cn(
              'size-5 shrink-0 text-secondary/50 transition-transform duration-200',
              expanded && 'rotate-90 text-primary',
            )}
          />
          <span className="font-nunito flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {index + 1}
          </span>

          {expanded ? (
            <span className="font-nunito text-lg font-bold text-secondary">
              Pregunta {index + 1}
            </span>
          ) : (
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={cn(
                  'font-inter min-w-0 flex-1 truncate text-sm',
                  question.text.trim() ? 'text-secondary' : 'italic text-secondary/40',
                )}
              >
                {summary}
              </span>
            </span>
          )}
        </button>

        {/* Compact meta — only when collapsed, to keep the summary informative. */}
        {!expanded && (
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            <span className="font-inter rounded-full bg-secondary/5 px-2.5 py-1 text-xs font-medium text-secondary/70">
              {QUESTION_TYPE_LABELS[question.type]}
            </span>
            <span
              className={cn(
                'font-inter rounded-full px-2.5 py-1 text-xs font-semibold',
                difficultyChip[question.difficulty],
              )}
            >
              {DIFFICULTY_LABELS[question.difficulty]}
            </span>
            <span className="font-nunito rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold tabular-nums text-primary">
              {question.points} pts
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`Eliminar pregunta ${index + 1}`}
          title="Eliminar pregunta"
          className={cn(iconButton, 'hover:bg-danger/10 hover:text-danger')}
        >
          <TrashIcon className="size-4" />
        </button>
      </div>

      {/* Body — only mounted when expanded. */}
      {expanded && (
        <div className="animate-fade-in grid gap-4 border-t border-secondary/10 p-5 pt-4">
          <textarea
            value={question.text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Escribe el enunciado de la pregunta…"
            rows={2}
            autoFocus
            className="font-inter w-full resize-y rounded-lg border border-secondary/20 bg-white px-3 py-2 text-secondary placeholder:text-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
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
            <span className="font-inter text-sm font-medium text-secondary/70">Dificultad</span>
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
                        : 'border-secondary/30 text-secondary/80 hover:border-secondary/50',
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
              <span className="font-inter text-sm font-medium text-secondary/70">
                {mode === 'multiple'
                  ? 'Opciones (marca las correctas)'
                  : 'Opciones (marca la correcta)'}
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
                  title="Agregar una nueva opción"
                  className="font-inter inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-secondary/5 hover:text-accent-hover"
                >
                  <span className="text-base leading-none">+</span> Agregar opción
                </button>
              )}
            </div>
          ) : (
            <p className="font-inter rounded-lg bg-secondary/5 px-3 py-2 text-sm text-secondary/70">
              El alumno responde en texto libre. Esta pregunta se calificará manualmente.
            </p>
          )}
        </div>
      )}

      {/* Subtle validity hint while collapsed, when a choice question has no
          correct answer marked — surfaces problems without opening the card. */}
      {!expanded && hasOptions(question.type) && correctCount === 0 && (
        <p className="font-inter border-t border-danger/20 bg-danger/5 px-5 py-2 text-xs text-danger">
          Falta marcar la respuesta correcta.
        </p>
      )}
    </div>
  )
}
