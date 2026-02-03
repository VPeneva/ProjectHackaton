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
}

export default adminService
