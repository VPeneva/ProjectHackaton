import api from './api'

export const usersService = {
  getProfile: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },
  getMySubscriptions: async () => {
    const response = await api.get('/users/me/subscriptions')
    return response.data
  },
  getLeaderboard: async (limit) => {
    const params = limit ? { limit } : {}
    const response = await api.get('/users/leaderboard', { params })
    return response.data
  },
}

export default usersService
