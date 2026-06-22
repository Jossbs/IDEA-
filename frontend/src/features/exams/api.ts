import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type {
  CreateExamPayload,
  CreateExamResponse,
  ExamDetail,
  ExamResults,
  ExamSummary,
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

/** Creates a full exam (with nested questions and options) via POST /api/exams. */
export function useCreateExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateExamPayload) =>
      api.post<CreateExamResponse>('/exams', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  })
}
