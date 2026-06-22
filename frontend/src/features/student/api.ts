import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { AnswerSubmission, AttemptResult, StudentExam, StudentExamCard } from './types'

const KEY = 'student-exams'

/** Published exams available to the student (with an alreadyTaken flag). */
export function useAvailableExams() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => api.get<StudentExamCard[]>('/student/exams'),
  })
}

/** The sanitized exam to take. Disabled until an id is provided. */
export function useStudentExam(examId: string | undefined) {
  return useQuery({
    queryKey: [KEY, examId],
    queryFn: () => api.get<StudentExam>(`/student/exams/${examId}`),
    enabled: Boolean(examId),
    staleTime: Infinity, // the exam doesn't change mid-attempt
  })
}

/** Submits answers and returns the graded result. */
export function useSubmitAttempt(examId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (answers: AnswerSubmission[]) =>
      api.post<AttemptResult>(`/student/exams/${examId}/attempts`, { answers }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  })
}
