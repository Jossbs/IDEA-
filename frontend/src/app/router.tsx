import { createBrowserRouter, Navigate } from 'react-router-dom'
import { CreateExamView } from '@/features/exams/CreateExamView'
import { ExamListView } from '@/features/exams/ExamListView'
import { ExamResultsView } from '@/features/exams/ExamResultsView'
import { StudentExamView } from '@/features/exams/StudentExamView'
import { SubjectsView } from '@/features/subjects/SubjectsView'
import { AppLayout } from './AppLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/subjects" replace /> },
      { path: 'subjects', element: <SubjectsView /> },
      { path: 'exams', element: <ExamListView /> },
      { path: 'exams/new', element: <CreateExamView /> },
      { path: 'exams/:examId/results', element: <ExamResultsView /> },
    ],
  },
  // Entorno libre de distracciones: la resolución del examen vive FUERA de
  // AppLayout (sin navbar/sidebar) para aislar por completo al estudiante.
  { path: '/exam/:examId/take', element: <StudentExamView /> },
])
