import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type {
  AttemptReview,
  CreateExamPayload,
  CreateExamResponse,
  ExamDetail,
  ExamResults,
  ExamSummary,
  QuestionGrade,
  Student,
} from './types'

const KEY = 'exams'

/** Lists the teacher's exams (active records) as dashboard summaries. */
export function useExams() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => api.get<ExamSummary[]>('/exams'),
  })
}

/** Fetches a single exam's full detail. Disabled until an id is provided. */
export function useExam(examId: string | undefined) {
  return useQuery({
    queryKey: [KEY, examId],
    queryFn: () => api.get<ExamDetail>(`/exams/${examId}`),
    enabled: Boolean(examId),
  })
}

/** Fetches the results panel for an exam (teacher, owner-scoped). */
export function useExamResults(examId: string | undefined) {
  return useQuery({
    queryKey: [KEY, examId, 'results'],
    queryFn: () => api.get<ExamResults>(`/exams/${examId}/results`),
    enabled: Boolean(examId),
  })
}

/** Fetches one attempt's short-text answers to grade manually. */
export function useAttemptReview(examId: string | undefined, attemptId: string | undefined) {
  return useQuery({
    queryKey: [KEY, examId, 'attempts', attemptId],
    queryFn: () => api.get<AttemptReview>(`/exams/${examId}/attempts/${attemptId}/review`),
    enabled: Boolean(examId && attemptId),
  })
}

/** Submits manual grades for an attempt's short-text answers. */
export function useSubmitReview(examId: string | undefined, attemptId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (grades: QuestionGrade[]) =>
      api.post<void>(`/exams/${examId}/attempts/${attemptId}/review`, { grades }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY, examId, 'results'] })
      queryClient.invalidateQueries({ queryKey: [KEY, examId, 'attempts', attemptId] })
    },
  })
}

/** Creates a full exam (with nested questions and options) via POST /api/exams. */
export function useCreateExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateExamPayload) =>
      api.post<CreateExamResponse>('/exams', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  })
}

/** Updates an exam (config + questions + assignments) via PUT /api/exams/{id}. */
export function useUpdateExam(examId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateExamPayload) => api.put<void>(`/exams/${examId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      queryClient.invalidateQueries({ queryKey: [KEY, examId] })
    },
  })
}

/** The student directory, for assigning exams. */
export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => api.get<Student[]>('/students'),
  })
}

/** Replaces an exam's assigned students. */
export function useAssignStudents(examId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentIds: string[]) =>
      api.put<void>(`/exams/${examId}/assignments`, { studentIds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY, examId] }),
  })
}
