import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsService } from '@/services/reports'
import { toast } from 'sonner'

export function useReports(params = {}) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => reportsService.getReports(params),
  })
}

export function useReport(id) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsService.getReport(id),
    enabled: !!id,
  })
}

export function useReportStats() {
  return useQuery({
    queryKey: ['reportStats'],
    queryFn: () => reportsService.getStats(),
  })
}

export function useMapReports() {
  return useQuery({
    queryKey: ['mapReports'],
    queryFn: () => reportsService.getMapReports(),
  })
}

export function useActiveReports() {
  return useQuery({
    queryKey: ['activeReports'],
    queryFn: () => reportsService.getActiveReports(),
  })
}

export function useCreateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reportsService.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['reportStats'] })
      queryClient.invalidateQueries({ queryKey: ['mapReports'] })
      toast.success('Report created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create report')
    },
  })
}

export function useDeleteReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reportsService.deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['reportStats'] })
      queryClient.invalidateQueries({ queryKey: ['mapReports'] })
      toast.success('Report deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete report')
    },
  })
}
