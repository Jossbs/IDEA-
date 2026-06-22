import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { CreateExamPayload, CreateExamResponse } from './types'

const KEY = 'exams'

/** Creates a full exam (with nested questions and options) via POST /api/exams. */
export function useCreateExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateExamPayload) =>
      api.post<CreateExamResponse>('/exams', payload),
    // Forward-compatible: refresh the (future) exam list once it reads from the API.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  })
}
