import api from './api'

export const categoriesService = {
  // Get all categories (optionally filtered by institution)
  getAll: async (institutionId) => {
    const params = institutionId ? { institutionId } : {}
    const response = await api.get('/categories', { params })
    return response.data
  },

  // Create category (admin only)
  create: async (name, institutionId) => {
    const response = await api.post('/categories', { name, institutionId })
    return response.data
  },

  // Delete category (admin only)
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  },
}

export default categoriesService
