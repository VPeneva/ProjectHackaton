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

  // Delete report
  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`)
    return response.data
  },
}

export default reportsService
