import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin'
import { contactService } from '@/services/contact'
import { toast } from 'sonner'

export function useAdminReports(institutionId) {
  return useQuery({
    queryKey: ['adminReports', institutionId],
    queryFn: () => adminService.getReports(institutionId).then(r => r.data),
  })
}

export function useAdmin(institutionId) {
  return useQuery({
    queryKey: ['adminReports', institutionId],
    queryFn: () => adminService.getReports(institutionId).then(r => r.data),
  })
}

export function useResolvedReports() {
  return useQuery({
    queryKey: ['resolvedReports'],
    queryFn: () => adminService.getResolvedReports().then(r => r.data),
  })
}

export function useSendReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, institutionId }) => adminService.sendReport(id, institutionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['reportStats'] })
      toast.success('Report sent to institution')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to send report')
    },
  })
}

export function useResolveReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminService.resolveReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] })
      queryClient.invalidateQueries({ queryKey: ['resolvedReports'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['reportStats'] })
      toast.success('Report marked as resolved')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to resolve report')
    },
  })
}

export function useDeleteReportPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminService.deleteReportPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Photo removed from report')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to remove photo')
    },
  })
}

export function useContactMessages() {
  return useQuery({
    queryKey: ['contactMessages'],
    queryFn: () => contactService.getAll().then(r => r.data),
  })
}
