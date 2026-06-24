import { CustomSelect } from '@/design-system/components/CustomSelect'
import { TextField } from '@/design-system/components/Field'
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

/** Selected difficulty pill — a single, formal primary fill (radio-group look). */
const difficultyActiveClass = 'border-primary bg-primary text-white'

/** Soft semantic tint for the difficulty chip shown in the collapsed summary. */
const difficultyChip: Record<DifficultyLevel, string> = {
  LOW: 'bg-success-bg text-success-text',
  MEDIUM: 'bg-info-bg text-info-text',
  HIGH: 'bg-danger-bg text-danger-text',
}

/** Shared subtle icon-button: warm-gray hover, slate-blue icon. */
const iconButton =
  'inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors ' +
  'hover:bg-app hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 ' +
  'disabled:hover:bg-transparent disabled:hover:text-muted'

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
        expanded ? 'border-primary/30 ring-1 ring-primary/10' : 'border-subtle',
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
              'size-5 shrink-0 text-muted transition-transform duration-200',
              expanded && 'rotate-90 text-primary',
            )}
          />
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {index + 1}
          </span>

          {expanded ? (
            <span className="text-lg font-bold text-main">
              Pregunta {index + 1}
            </span>
          ) : (
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={cn(
                  'font-inter min-w-0 flex-1 truncate text-sm',
                  question.text.trim() ? 'text-main' : 'italic text-muted/70',
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
            <span className="font-inter rounded-full bg-app px-2.5 py-1 text-xs font-medium text-muted">
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
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold tabular-nums text-primary">
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
          className={cn(iconButton, 'hover:bg-danger-bg hover:text-danger-text')}
        >
          <TrashIcon className="size-4" />
        </button>
      </div>

      {/* Body — only mounted when expanded. */}
      {expanded && (
        <div className="animate-fade-in grid gap-4 border-t border-subtle p-5 pt-4">
          <textarea
            value={question.text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Escribe el enunciado de la pregunta…"
            rows={2}
            autoFocus
            className="font-inter w-full resize-y rounded-md border border-subtle bg-app/50 px-3 py-2 text-main transition-colors placeholder:text-muted/70 hover:border-focus focus-visible:border-primary focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
          />

          {/* Type + points */}
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <CustomSelect
              label="Tipo de respuesta"
              options={QUESTION_TYPES.map((type) => ({
                value: type,
                label: QUESTION_TYPE_LABELS[type],
              }))}
              value={question.type}
              onChange={(value) => onTypeChange(value as QuestionType)}
            />

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
            <span className="font-inter text-sm font-medium text-main">Dificultad</span>
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
                        ? difficultyActiveClass
                        : 'border-subtle bg-surface text-muted hover:border-focus',
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
              <span className="font-inter text-sm font-medium text-main">
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
                  className="font-inter inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5 hover:text-primary-hover"
                >
                  <span className="text-base leading-none">+</span> Agregar opción
                </button>
              )}
            </div>
          ) : (
            <p className="font-inter rounded-lg bg-app px-3 py-2 text-sm text-muted">
              El alumno responde en texto libre. Esta pregunta se calificará manualmente.
            </p>
          )}
        </div>
      )}

      {/* Subtle validity hint while collapsed, when a choice question has no
          correct answer marked — surfaces problems without opening the card. */}
      {!expanded && hasOptions(question.type) && correctCount === 0 && (
        <p className="font-inter border-t border-danger-text/20 bg-danger-bg px-5 py-2 text-xs font-medium text-danger-text">
          Falta marcar la respuesta correcta.
        </p>
      )}
    </div>
  )
}
