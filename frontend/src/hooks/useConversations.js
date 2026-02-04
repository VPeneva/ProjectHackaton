import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { conversationsService } from '@/services/conversations'
import { toast } from 'sonner'

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationsService.getAll(),
  })
}

export function useConversation(id) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationsService.getById(id),
    enabled: !!id,
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subject, message }) => conversationsService.create(subject, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('Message sent successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to send message')
    },
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, content }) =>
      conversationsService.sendMessage(conversationId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to send message')
    },
  })
}

export function useCloseConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => conversationsService.close(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', id] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('Conversation closed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to close conversation')
    },
  })
}

export function useReopenConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => conversationsService.reopen(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', id] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('Conversation reopened')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to reopen conversation')
    },
  })
}
