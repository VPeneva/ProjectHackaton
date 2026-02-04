import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsService } from '@/services/reports'
import { toast } from 'sonner'

const REPORT_REFRESH_INTERVAL = 1000 * 30

export function useReports(params = {}) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => reportsService.getReports(params),
    staleTime: REPORT_REFRESH_INTERVAL,
    refetchInterval: REPORT_REFRESH_INTERVAL,
  })
}

export function useReport(id) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsService.getReport(id),
    enabled: !!id,
    staleTime: REPORT_REFRESH_INTERVAL,
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

export function useUpdateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => reportsService.updateReport(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['report', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['reportStats'] })
      queryClient.invalidateQueries({ queryKey: ['mapReports'] })
      toast.success('Report updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update report')
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

export function useComments(reportId) {
  return useQuery({
    queryKey: ['comments', reportId],
    queryFn: () => reportsService.getComments(reportId),
    enabled: !!reportId,
  })
}

export function useAddComment(reportId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content) => reportsService.addComment(reportId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', reportId] })
      queryClient.invalidateQueries({ queryKey: ['report', reportId] })
      toast.success('Comment added')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add comment')
    },
  })
}

export function useDeleteComment(reportId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId) => reportsService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', reportId] })
      queryClient.invalidateQueries({ queryKey: ['report', reportId] })
      toast.success('Comment deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete comment')
    },
  })
}

export function useSubscription(reportId, enabled = true) {
  return useQuery({
    queryKey: ['subscription', reportId],
    queryFn: () => reportsService.getSubscription(reportId),
    enabled: !!reportId && enabled,
  })
}

export function useSubscribe(reportId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => reportsService.subscribe(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', reportId] })
      queryClient.invalidateQueries({ queryKey: ['report', reportId] })
      toast.success('Subscribed to report updates')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to subscribe')
    },
  })
}

export function useUnsubscribe(reportId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => reportsService.unsubscribe(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', reportId] })
      queryClient.invalidateQueries({ queryKey: ['report', reportId] })
      toast.success('Unsubscribed from report updates')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to unsubscribe')
    },
  })
}
