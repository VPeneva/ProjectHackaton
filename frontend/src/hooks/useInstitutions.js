import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { institutionsService } from '@/services/institutions'
import { toast } from 'sonner'

export function useInstitutions() {
  return useQuery({
    queryKey: ['institutions'],
    queryFn: () => institutionsService.getAll().then(r => r.data),
  })
}

export function useCreateInstitution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: institutionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] })
      toast.success('Institution created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create institution')
    },
  })
}

export function useDeleteInstitution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: institutionsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] })
      toast.success('Institution deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete institution')
    },
  })
}
