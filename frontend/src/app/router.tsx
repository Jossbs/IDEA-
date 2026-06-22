import { createBrowserRouter } from 'react-router-dom'
import { LoginView } from '@/features/auth/LoginView'
import { RegisterView } from '@/features/auth/RegisterView'
import { AttemptReviewView } from '@/features/exams/AttemptReviewView'
import { CreateExamView } from '@/features/exams/CreateExamView'
import { ExamListView } from '@/features/exams/ExamListView'
import { ExamPreviewView } from '@/features/exams/ExamPreviewView'
import { ExamResultsView } from '@/features/exams/ExamResultsView'
import { StudentExamView } from '@/features/exams/StudentExamView'
import { StudentResultView } from '@/features/student/StudentResultView'
import { SubjectsView } from '@/features/subjects/SubjectsView'
import { AppLayout } from './AppLayout'
import { HomeRedirect } from './HomeRedirect'
import { RequireAuth } from './RequireAuth'

export const router = createBrowserRouter([
  // Public auth screens (no shell, no guard).
  { path: '/login', element: <LoginView /> },
  { path: '/register', element: <RegisterView /> },

  // Everything below requires a valid session.
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <HomeRedirect /> },
          // Student self-review of a graded attempt (inside the shell).
          { path: 'exam/:examId/result', element: <StudentResultView /> },
          // Teacher workspace.
          {
            element: <RequireAuth role="TEACHER" />,
            children: [
              { path: 'subjects', element: <SubjectsView /> },
              { path: 'exams', element: <ExamListView /> },
              { path: 'exams/new', element: <CreateExamView /> },
              { path: 'exams/:examId/edit', element: <CreateExamView /> },
              { path: 'exams/:examId/preview', element: <ExamPreviewView /> },
              { path: 'exams/:examId/results', element: <ExamResultsView /> },
              {
                path: 'exams/:examId/attempts/:attemptId/review',
                element: <AttemptReviewView />,
              },
            ],
          },
        ],
      },
      // Distraction-free exam runner lives outside AppLayout (no navbar/sidebar).
      { path: '/exam/:examId/take', element: <StudentExamView /> },
    ],
  },
])
