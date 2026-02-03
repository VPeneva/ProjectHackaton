import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin'
import { contactService } from '@/services/contact'
import { toast } from 'sonner'

export function useAdminReports(institutionId) {
  return useQuery({
    queryKey: ['adminReports', institutionId],
    queryFn: () => adminService.getReports(institutionId),
  })
}

export function useAdmin(institutionId) {
  return useQuery({
    queryKey: ['adminReports', institutionId],
    queryFn: () => adminService.getReports(institutionId),
  })
}

export function useResolvedReports() {
  return useQuery({
    queryKey: ['resolvedReports'],
    queryFn: () => adminService.getResolvedReports(),
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
    queryFn: () => contactService.getAll(),
  })
}

export function useVoteAnalytics() {
  return useQuery({
    queryKey: ['voteAnalytics'],
    queryFn: () => adminService.getVoteAnalytics(),
  })
}
