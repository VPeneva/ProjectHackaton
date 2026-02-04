import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { votesService } from '@/services/votes'
import { toast } from 'sonner'

const VOTE_REFRESH_INTERVAL = 1000 * 30

export function useVoteSummary(reportId, initialData) {
  return useQuery({
    queryKey: ['voteSummary', reportId],
    queryFn: () => votesService.getVoteSummary(reportId),
    enabled: !!reportId,
    initialData,
    staleTime: VOTE_REFRESH_INTERVAL,
    refetchInterval: VOTE_REFRESH_INTERVAL,
  })
}

export function useMyVote(reportId, enabled = true) {
  return useQuery({
    queryKey: ['myVote', reportId],
    queryFn: () => votesService.getMyVote(reportId),
    enabled: !!reportId && enabled,
  })
}

export function useVote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportId, type, reason }) =>
      votesService.voteOnReport(reportId, type, reason),
    onMutate: async ({ reportId, type, reason }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['voteSummary', reportId] }),
        queryClient.cancelQueries({ queryKey: ['myVote', reportId] }),
      ])

      const previousSummary = queryClient.getQueryData(['voteSummary', reportId])
      const previousVote = queryClient.getQueryData(['myVote', reportId])

      const summary = previousSummary || { upvotes: 0, downvotes: 0, total: 0 }
      let upvotes = summary.upvotes ?? 0
      let downvotes = summary.downvotes ?? 0

      if (previousVote?.type === 'UP') upvotes = Math.max(0, upvotes - 1)
      if (previousVote?.type === 'DOWN') downvotes = Math.max(0, downvotes - 1)

      if (type === 'UP') upvotes += 1
      if (type === 'DOWN') downvotes += 1

      queryClient.setQueryData(['voteSummary', reportId], {
        upvotes,
        downvotes,
        total: upvotes + downvotes,
      })
      queryClient.setQueryData(['myVote', reportId], { type, reason })

      return { previousSummary, previousVote }
    },
    onError: (error, { reportId }, context) => {
      if (context?.previousSummary === undefined) {
        queryClient.removeQueries({ queryKey: ['voteSummary', reportId] })
      } else {
        queryClient.setQueryData(['voteSummary', reportId], context.previousSummary)
      }

      if (context?.previousVote === undefined) {
        queryClient.removeQueries({ queryKey: ['myVote', reportId] })
      } else {
        queryClient.setQueryData(['myVote', reportId], context.previousVote)
      }

      toast.error(error.response?.data?.error || 'Failed to submit vote')
    },
    onSuccess: () => {
      toast.success('Vote submitted')
    },
    onSettled: (_, __, variables) => {
      if (variables?.reportId) {
        queryClient.invalidateQueries({ queryKey: ['voteSummary', variables.reportId] })
        queryClient.invalidateQueries({ queryKey: ['myVote', variables.reportId] })
      }
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['adminReports'] })
      queryClient.invalidateQueries({ queryKey: ['resolvedReports'] })
      queryClient.invalidateQueries({ queryKey: ['voteAnalytics'] })
    },
  })
}

export function useRemoveVote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reportId) => votesService.removeVote(reportId),
    onMutate: async (reportId) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['voteSummary', reportId] }),
        queryClient.cancelQueries({ queryKey: ['myVote', reportId] }),
      ])

      const previousSummary = queryClient.getQueryData(['voteSummary', reportId])
      const previousVote = queryClient.getQueryData(['myVote', reportId])

      const summary = previousSummary || { upvotes: 0, downvotes: 0, total: 0 }
      let upvotes = summary.upvotes ?? 0
      let downvotes = summary.downvotes ?? 0

      if (previousVote?.type === 'UP') upvotes = Math.max(0, upvotes - 1)
      if (previousVote?.type === 'DOWN') downvotes = Math.max(0, downvotes - 1)

      queryClient.setQueryData(['voteSummary', reportId], {
        upvotes,
        downvotes,
        total: upvotes + downvotes,
      })
      queryClient.setQueryData(['myVote', reportId], null)

      return { previousSummary, previousVote }
    },
    onError: (error, reportId, context) => {
      if (context?.previousSummary === undefined) {
        queryClient.removeQueries({ queryKey: ['voteSummary', reportId] })
      } else {
        queryClient.setQueryData(['voteSummary', reportId], context.previousSummary)
      }

      if (context?.previousVote === undefined) {
        queryClient.removeQueries({ queryKey: ['myVote', reportId] })
      } else {
        queryClient.setQueryData(['myVote', reportId], context.previousVote)
      }

      toast.error(error.response?.data?.error || 'Failed to remove vote')
    },
    onSuccess: () => {
      toast.success('Vote removed')
    },
    onSettled: (_, __, reportId) => {
      if (reportId) {
        queryClient.invalidateQueries({ queryKey: ['voteSummary', reportId] })
        queryClient.invalidateQueries({ queryKey: ['myVote', reportId] })
      }
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['adminReports'] })
      queryClient.invalidateQueries({ queryKey: ['resolvedReports'] })
      queryClient.invalidateQueries({ queryKey: ['voteAnalytics'] })
    },
  })
}
