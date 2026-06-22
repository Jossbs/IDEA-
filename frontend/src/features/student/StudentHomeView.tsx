import { useNavigate } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import { CheckCircleIcon, FileTextIcon } from '@/design-system/icons'
import { useAuth } from '@/features/auth/AuthContext'
import { ACADEMIC_LEVEL_LABELS } from '@/features/subjects/types'
import { ApiError } from '@/lib/apiClient'
import { useAvailableExams } from './api'
import type { StudentExamCard } from './types'

/** Student dashboard: published exams to take. */
export function StudentHomeView() {
  const { user } = useAuth()
  const { data: exams, isLoading, isError, error } = useAvailableExams()

  return (
    <div className="grid gap-8">
      <header>
        <h1 className="font-nunito text-3xl font-extrabold text-secondary">
          Hola, {user?.fullName}
        </h1>
        <p className="font-inter mt-1 text-secondary/70">
          Estos son los exámenes disponibles para ti.
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="h-36 animate-pulse bg-secondary/[0.04] shadow-sm" />
          ))}
        </div>
      ) : isError ? (
        <Card className="font-inter text-danger shadow-sm">
          No se pudieron cargar los exámenes
          {error instanceof ApiError ? `: ${error.message}` : '.'}
        </Card>
      ) : !exams || exams.length === 0 ? (
        <Card className="font-inter text-secondary/70 shadow-sm">
          Aún no hay exámenes disponibles. Vuelve más tarde.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <StudentExamCardView key={exam.examId} exam={exam} />
          ))}
        </div>
      )}
    </div>
  )
}

function StudentExamCardView({ exam }: { exam: StudentExamCard }) {
  const navigate = useNavigate()

  return (
    <Card className="flex flex-col gap-4 shadow-sm">
      <div>
        <h3 className="font-nunito text-lg font-bold text-secondary">{exam.title}</h3>
        <p className="font-inter mt-0.5 text-sm text-secondary/70">
          {exam.subjectName} · {ACADEMIC_LEVEL_LABELS[exam.academicLevel]}
        </p>
      </div>

      <span className="font-inter inline-flex items-center gap-1.5 text-sm text-secondary/70">
        <FileTextIcon className="size-4" />
        {exam.questionCount} {exam.questionCount === 1 ? 'pregunta' : 'preguntas'}
      </span>

      <div className="mt-auto pt-2">
        {exam.alreadyTaken ? (
          <span className="font-inter inline-flex items-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-sm font-semibold text-success">
            <CheckCircleIcon className="size-4" />
            Ya presentado
          </span>
        ) : (
          <Button variant="accent" fullWidth onClick={() => navigate(`/exam/${exam.examId}/take`)}>
            Resolver examen
          </Button>
        )}
      </div>
    </Card>
  )
}
