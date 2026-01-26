import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories'
import { toast } from 'sonner'

export function useCategories(institutionId) {
  return useQuery({
    queryKey: ['categories', institutionId],
    queryFn: () => categoriesService.getAll(institutionId).then(r => r.data),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, institutionId }) => categoriesService.create(name, institutionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create category')
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: categoriesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete category')
    },
  })
}
