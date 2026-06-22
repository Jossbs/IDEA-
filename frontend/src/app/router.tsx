import { createBrowserRouter, Navigate } from 'react-router-dom'
import { CreateExamView } from '@/features/exams/CreateExamView'
import { SubjectsView } from '@/features/subjects/SubjectsView'
import { AppLayout } from './AppLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/subjects" replace /> },
      { path: 'subjects', element: <SubjectsView /> },
      { path: 'exams', element: <CreateExamView /> },
    ],
  },
])
