import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { institutionService } from '@/services/institution'
import { reportsService } from '@/services/reports'
import { toast } from 'sonner'

export function useInstitutionReports() {
  return useQuery({
    queryKey: ['institutionReports'],
    queryFn: () => institutionService.getReports(),
  })
}

export function useResolveInstitutionReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => institutionService.resolveReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutionReports'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['reportStats'] })
      toast.success('Report marked as resolved')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to resolve report')
    },
  })
}

export function useInstitutionResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportId, content }) => reportsService.addComment(reportId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['institutionReports'] })
      queryClient.invalidateQueries({ queryKey: ['comments', variables.reportId] })
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] })
      toast.success('Response sent')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to send response')
    },
  })
}
