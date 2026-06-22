import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import {
  CalendarIcon,
  EyeIcon,
  FileTextIcon,
  PencilIcon,
  SearchIcon,
  SendIcon,
} from '@/design-system/icons'
import { cn } from '@/lib/cn'

type ExamStatus = 'PUBLISHED' | 'DRAFT'

interface ExamSummary {
  id: string
  title: string
  subject: string
  level: string
  status: ExamStatus
  questionCount: number
  /** ISO date of the last edit. */
  updatedAt: string
}

/** Mock catalog so the dashboard renders before the GET endpoint exists. */
const MOCK_EXAMS: ExamSummary[] = [
  {
    id: '1',
    title: 'Examen Parcial 1 — Cinemática',
    subject: 'Física',
    level: 'Bachillerato',
    status: 'PUBLISHED',
    questionCount: 12,
    updatedAt: '2026-06-18',
  },
  {
    id: '2',
    title: 'Diagnóstico de Álgebra',
    subject: 'Matemáticas',
    level: 'Universidad',
    status: 'DRAFT',
    questionCount: 8,
    updatedAt: '2026-06-20',
  },
  {
    id: '3',
    title: 'Quiz: Tabla Periódica',
    subject: 'Química',
    level: 'Bachillerato',
    status: 'PUBLISHED',
    questionCount: 15,
    updatedAt: '2026-06-12',
  },
  {
    id: '4',
    title: 'Examen Final — Revolución Mexicana',
    subject: 'Historia',
    level: 'Secundaria',
    status: 'DRAFT',
    questionCount: 20,
    updatedAt: '2026-06-21',
  },
  {
    id: '5',
    title: 'Comprensión Lectora I',
    subject: 'Lengua y Literatura',
    level: 'Secundaria',
    status: 'PUBLISHED',
    questionCount: 10,
    updatedAt: '2026-06-09',
  },
  {
    id: '6',
    title: 'Repaso: Genética Básica',
    subject: 'Biología',
    level: 'Bachillerato',
    status: 'DRAFT',
    questionCount: 6,
    updatedAt: '2026-06-22',
  },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }: { status: ExamStatus }) {
  return status === 'PUBLISHED' ? (
    <span className="font-inter rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
      Publicado
    </span>
  ) : (
    <span className="font-inter rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary/60">
      Borrador
    </span>
  )
}

type CardActionProps = {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

function CardAction({ icon, label, onClick }: CardActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-inter inline-flex items-center gap-1.5 text-sm font-medium text-secondary/60 transition-colors hover:text-accent"
    >
      {icon}
      {label}
    </button>
  )
}

function ExamCard({ exam }: { exam: ExamSummary }) {
  return (
    <Card className="relative flex flex-col gap-4 shadow-sm transition-shadow hover:shadow-card">
      <span className="absolute right-4 top-4">
        <StatusBadge status={exam.status} />
      </span>

      <div className="pr-24">
        <h3 className="font-nunito text-lg font-bold text-secondary">{exam.title}</h3>
        <p className="font-inter mt-0.5 text-sm text-secondary/60">
          {exam.subject} · {exam.level}
        </p>
      </div>

      <div className="font-inter flex flex-wrap items-center gap-4 text-sm text-secondary/60">
        <span className="inline-flex items-center gap-1.5">
          <FileTextIcon className="size-4" />
          {exam.questionCount} preguntas
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon className="size-4" />
          {formatDate(exam.updatedAt)}
        </span>
      </div>

      <div className="mt-auto flex items-center gap-5 border-t border-secondary/10 pt-3">
        <CardAction icon={<PencilIcon className="size-4" />} label="Editar" />
        <CardAction icon={<EyeIcon className="size-4" />} label="Previsualizar" />
        <CardAction
          icon={<SendIcon className="size-4" />}
          label={exam.status === 'PUBLISHED' ? 'Asignar' : 'Publicar'}
        />
      </div>
    </Card>
  )
}

/** Teacher dashboard listing every authored exam as a premium card. */
export function ExamListView() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const exams = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MOCK_EXAMS
    return MOCK_EXAMS.filter(
      (exam) =>
        exam.title.toLowerCase().includes(q) || exam.subject.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-secondary">Mis Evaluaciones</h1>
          <p className="font-inter mt-1 text-secondary/60">
            Administra tus exámenes: borradores y publicados.
          </p>
        </div>
        <Button variant="accent" onClick={() => navigate('/exams/new')}>
          + Nuevo Examen
        </Button>
      </header>

      {/* Search */}
      <div className="relative max-w-md">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar examen por nombre o materia…"
          className="font-inter w-full rounded-lg border border-secondary/20 bg-white py-2 pl-9 pr-3 text-secondary placeholder:text-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-base"
        />
      </div>

      {/* Catalog grid */}
      {exams.length === 0 ? (
        <Card className="font-inter text-secondary/60 shadow-sm">
          No se encontraron exámenes que coincidan con “{query}”.
        </Card>
      ) : (
        <div className={cn('grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3')}>
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  )
}
