import api from './api'

export const contactService = {
  // Submit contact form (public)
  submit: async (data) => {
    const response = await api.post('/contact', data)
    return response.data
  },

  // Get all contact messages (admin only)
  getAll: async () => {
    const response = await api.get('/contact')
    return response.data
  },
}

export default contactService
