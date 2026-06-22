import { Card } from '@/design-system/components/Card'
import { TrashIcon } from '@/design-system/icons'
import { MIN_OPTIONS } from '../types'
import type { ExamQuestion } from '../types'
import { OptionRow } from './OptionRow'

type QuestionCardProps = {
  question: ExamQuestion
  index: number
  /** False for the last remaining question, so the exam always has at least one. */
  canRemove: boolean
  onTextChange: (text: string) => void
  onOptionTextChange: (optionId: string, text: string) => void
  onMarkCorrect: (optionId: string) => void
  onAddOption: () => void
  onRemoveOption: (optionId: string) => void
  onRemove: () => void
}

/** Self-contained card for authoring one question and its options. */
export function QuestionCard({
  question,
  index,
  canRemove,
  onTextChange,
  onOptionTextChange,
  onMarkCorrect,
  onAddOption,
  onRemoveOption,
  onRemove,
}: QuestionCardProps) {
  const canRemoveOption = question.options.length > MIN_OPTIONS

  return (
    <Card className="shadow-sm">
      <div className="grid gap-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-nunito text-lg font-bold text-secondary">Pregunta {index + 1}</h3>
          <button
            type="button"
            onClick={onRemove}
            disabled={!canRemove}
            aria-label={`Eliminar pregunta ${index + 1}`}
            title="Eliminar pregunta"
            className="text-secondary/50 transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-secondary/50"
          >
            <TrashIcon />
          </button>
        </div>

        <textarea
          value={question.text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Escribe el enunciado de la pregunta…"
          rows={2}
          className="font-inter w-full resize-y rounded-lg border border-secondary/20 bg-white px-3 py-2 text-secondary placeholder:text-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
        />

        <div className="grid gap-2">
          <span className="font-inter text-sm font-medium text-secondary/60">
            Opciones (marca la correcta)
          </span>
          {question.options.map((option, i) => (
            <OptionRow
              key={option.id}
              option={option}
              index={i}
              groupName={question.id}
              canRemove={canRemoveOption}
              onTextChange={(text) => onOptionTextChange(option.id, text)}
              onMarkCorrect={() => onMarkCorrect(option.id)}
              onRemove={() => onRemoveOption(option.id)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onAddOption}
          className="font-inter inline-flex w-fit items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
        >
          + Agregar opción
        </button>
      </div>
    </Card>
  )
}
