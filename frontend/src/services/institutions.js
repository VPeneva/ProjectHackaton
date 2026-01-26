import api from './api'

export const institutionsService = {
  // Get all institutions
  getAll: async () => {
    const response = await api.get('/institutions')
    return response.data
  },

  // Create institution (admin only)
  create: async (name) => {
    const response = await api.post('/institutions', { name })
    return response.data
  },

  // Delete institution (admin only)
  delete: async (id) => {
    const response = await api.delete(`/institutions/${id}`)
    return response.data
  },
}

export default institutionsService
