import api from './api'

export const conversationsService = {
  // Get all conversations (admin sees all, user sees their own)
  getAll: async () => {
    const response = await api.get('/conversations')
    return response.data
  },

  // Get single conversation with messages
  getById: async (id) => {
    const response = await api.get(`/conversations/${id}`)
    return response.data
  },

  // Create a new conversation
  create: async (subject, message) => {
    const response = await api.post('/conversations', { subject, message })
    return response.data
  },

  // Send a message in a conversation
  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/conversations/${conversationId}/messages`, { content })
    return response.data
  },

  // Close a conversation (admin only)
  close: async (id) => {
    const response = await api.patch(`/conversations/${id}/close`)
    return response.data
  },

  // Reopen a conversation (admin only)
  reopen: async (id) => {
    const response = await api.patch(`/conversations/${id}/reopen`)
    return response.data
  },
}

export default conversationsService
