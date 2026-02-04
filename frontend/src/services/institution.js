import api from './api'

export const institutionService = {
  getReports: async () => {
    const response = await api.get('/institution/reports')
    return response.data
  },
  resolveReport: async (id) => {
    const response = await api.patch(`/institution/reports/${id}/resolve`)
    return response.data
  },
}

export default institutionService
