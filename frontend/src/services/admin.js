import api from './api'

export const adminService = {
  // Get all non-finished reports
  getReports: async (institutionId) => {
    const params = institutionId ? { institutionId } : {}
    const response = await api.get('/admin/reports', { params })
    return response.data
  },

  // Send report to institution
  sendReport: async (id, institutionId) => {
    const response = await api.patch(`/admin/reports/${id}/send`, { institutionId })
    return response.data
  },

  // Mark report as finished
  resolveReport: async (id) => {
    const response = await api.patch(`/admin/reports/${id}/resolve`)
    return response.data
  },

  // Get resolved reports
  getResolvedReports: async () => {
    const response = await api.get('/admin/resolved')
    return response.data
  },

  // Delete report photo
  deleteReportPhoto: async (id) => {
    const response = await api.delete(`/admin/reports/${id}/photo`)
    return response.data
  },

  // Vote analytics
  getVoteAnalytics: async () => {
    const response = await api.get('/admin/vote-analytics')
    return response.data
  },

  // Bulk send reports
  bulkSendReports: async (ids, institutionId) => {
    const response = await api.post('/admin/reports/bulk-send', { ids, institutionId })
    return response.data
  },

  // Bulk resolve reports
  bulkResolveReports: async (ids) => {
    const response = await api.post('/admin/reports/bulk-resolve', { ids })
    return response.data
  },

  // Merge duplicate reports
  mergeReports: async (sourceId, targetId) => {
    const response = await api.post('/admin/reports/merge', { sourceId, targetId })
    return response.data
  },

  // Institution portal users
  getInstitutionUsers: async (institutionId) => {
    const response = await api.get(`/admin/institutions/${institutionId}/users`)
    return response.data
  },
  createInstitutionUser: async (institutionId, payload) => {
    const response = await api.post(`/admin/institutions/${institutionId}/users`, payload)
    return response.data
  },
  deleteInstitutionUser: async (institutionId, userId) => {
    const response = await api.delete(`/admin/institutions/${institutionId}/users/${userId}`)
    return response.data
  },

  // Report analytics
  getAnalytics: async (days) => {
    const params = days ? { days } : {}
    const response = await api.get('/admin/analytics', { params })
    return response.data
  },
}

export default adminService
