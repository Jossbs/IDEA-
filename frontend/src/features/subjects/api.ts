import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { Subject, SubjectRequest } from './types'

const KEY = 'subjects'

/** Lists subjects; pass `includeInactive` to also show deactivated records. */
export function useSubjects(includeInactive: boolean) {
  return useQuery({
    queryKey: [KEY, { includeInactive }],
    queryFn: () => api.get<Subject[]>(`/subjects?includeInactive=${includeInactive}`),
  })
}

export function useCreateSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: SubjectRequest) => api.post<Subject>('/subjects', request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: SubjectRequest }) =>
      api.put<Subject>(`/subjects/${id}`, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useSetSubjectActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch<Subject>(`/subjects/${id}/active`, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useDeleteSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/subjects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  })
}
