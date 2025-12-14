import apiClient from './api'
import { apiWrapper } from './notificationService'

export const veterinariansService = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString()
    return await apiWrapper.executeWithNotification(
      () => apiClient.get(`/veterinarians${query ? `?${query}` : ''}`),
      { operation: 'fetch', entityType: 'veterinarai', showSuccess: false, showError: true }
    )
  },
  async getById(id) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.get(`/veterinarians/${id}`),
      { operation: 'fetch', entityType: 'veterinaras', showSuccess: false, showError: true }
    )
  },
  async create(data) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.post('/veterinarians', data),
      { operation: 'create', entityType: 'veterinaras', showSuccess: true, showError: true, successMessage: 'Veterinaras pridėtas' }
    )
  },
  async update(id, data) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.put(`/veterinarians/${id}`, data),
      { operation: 'update', entityType: 'veterinaras', showSuccess: true, showError: true, successMessage: 'Veterinaro duomenys atnaujinti' }
    )
  },
  async remove(id) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.delete(`/veterinarians/${id}`),
      { operation: 'delete', entityType: 'veterinaras', showSuccess: true, showError: true, successMessage: 'Veterinaras pašalintas' }
    )
  }
}

export default veterinariansService
