import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { PencilIcon } from '@/design-system/icons'
import { ExamBuilderLayout } from './ExamBuilderLayout'
import { ExamHeaderCard } from './ExamHeaderCard'
import { QuestionCard } from './QuestionCard'

/**
 * Canvas-style exam builder (visual scaffold). Assembles the sticky layout,
 * the intro header card and a stack of question mockups so the flow can be
 * reviewed end-to-end. State here is local/presentational — no persistence yet.
 */
export function ExamBuilderCanvas() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('Examen sin título')
  const [description, setDescription] = useState('')

  return (
    <ExamBuilderLayout
      title={title}
      onTitleChange={setTitle}
      onBack={() => navigate(-1)}
    >
      <ExamHeaderCard
        title={title}
        onTitleChange={setTitle}
        description={description}
        onDescriptionChange={setDescription}
      />

      <QuestionCard
        index={1}
        defaultType="multiple"
        defaultPoints={2}
        defaultPrompt="¿Cuál es la capital de Francia?"
      />
      <QuestionCard
        index={2}
        defaultType="open"
        defaultPoints={5}
        defaultRequired={false}
        defaultPrompt="Explica con tus palabras el ciclo del agua."
      />

      <Button variant="secondary" fullWidth className="mt-2">
        <PencilIcon />
        Agregar pregunta
      </Button>
    </ExamBuilderLayout>
  )
}
