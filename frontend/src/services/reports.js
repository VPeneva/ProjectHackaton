import api from './api'

export const reportsService = {
  // Get all reports with pagination and filters
  getReports: async (params = {}) => {
    const response = await api.get('/reports', { params })
    return response.data
  },

  // Get single report
  getReport: async (id) => {
    const response = await api.get(`/reports/${id}`)
    return response.data
  },

  getSimilarReports: async (id, limit) => {
    const params = limit ? { limit } : {}
    const response = await api.get(`/reports/${id}/similar`, { params })
    return response.data
  },

  // Get active reports (Pending or Sent)
  getActiveReports: async () => {
    const response = await api.get('/reports/active')
    return response.data
  },

  // Get map reports (with location data)
  getMapReports: async () => {
    const response = await api.get('/reports/map')
    return response.data
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/reports/stats')
    return response.data
  },

  // Create report
  createReport: async (data) => {
    const response = await api.post('/reports', data)
    return response.data
  },

  // Update report
  updateReport: async (id, data) => {
    const response = await api.patch(`/reports/${id}`, data)
    return response.data
  },

  // Delete report
  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`)
    return response.data
  },

  // Comments
  getComments: async (id) => {
    const response = await api.get(`/reports/${id}/comments`)
    return response.data
  },

  addComment: async (id, content) => {
    const response = await api.post(`/reports/${id}/comments`, { content })
    return response.data
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/reports/comments/${commentId}`)
    return response.data
  },

  // Subscriptions
  getSubscription: async (id) => {
    const response = await api.get(`/reports/${id}/subscription`)
    return response.data
  },

  subscribe: async (id) => {
    const response = await api.post(`/reports/${id}/subscribe`)
    return response.data
  },

  unsubscribe: async (id) => {
    const response = await api.delete(`/reports/${id}/subscribe`)
    return response.data
  },
}

export default reportsService
