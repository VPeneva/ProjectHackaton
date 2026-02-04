import api from './api'

export const votesService = {
  voteOnReport: async (reportId, type) => {
    const response = await api.post(`/votes/reports/${reportId}`, { type })
    return response.data
  },

  removeVote: async (reportId) => {
    const response = await api.delete(`/votes/reports/${reportId}`)
    return response.data
  },

  getMyVote: async (reportId) => {
    const response = await api.get(`/votes/reports/${reportId}/my-vote`)
    return response.data
  },

  getVoteSummary: async (reportId) => {
    const response = await api.get(`/votes/reports/${reportId}/summary`)
    return response.data
  },
}

export default votesService
