import apiClient from './api'
import { apiWrapper } from './notificationService'

// API methods for animal-related subresources (vaccines, illnesses, products used)
const animalService = {
  async getVaccines(animalId) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.get(`/Animal/${animalId}/vaccines`),
      {
        operation: 'fetch',
        entityType: 'vaccine',
        showSuccess: false,
        showError: true,
        errorMessage: 'Nepavyko įkelti skiepų'
      }
    )
  },

  async getVaccineById(animalId, id) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.get(`/Animal/${animalId}/vaccines/${id}`),
      {
        operation: 'fetch',
        entityType: 'vaccine',
        showSuccess: false,
        showError: true,
        errorMessage: 'Nepavyko įkelti skiepo'
      }
    )
  },

  async getIllnesses(animalId) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.get(`/Animal/${animalId}/illnesses`),
      {
        operation: 'fetch',
        entityType: 'illness',
        showSuccess: false,
        showError: true,
        errorMessage: 'Nepavyko įkelti ligų'
      }
    )
  },

  async getIllnessById(animalId, id) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.get(`/Animal/${animalId}/illnesses/${id}`),
      {
        operation: 'fetch',
        entityType: 'illness',
        showSuccess: false,
        showError: true,
        errorMessage: 'Nepavyko įkelti ligos'
      }
    )
  },

  async getProductsUsed(animalId) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.get(`/Animal/${animalId}/productused`),
      {
        operation: 'fetch',
        entityType: 'productused',
        showSuccess: false,
        showError: true,
        errorMessage: 'Nepavyko įkelti naudojamų produktų'
      }
    )
  },

  async getProductUsedById(animalId, id) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.get(`/Animal/${animalId}/productused/${id}`),
      {
        operation: 'fetch',
        entityType: 'productused',
        showSuccess: false,
        showError: true,
        errorMessage: 'Nepavyko įkelti produkto'
      }
    )
  }
  ,

  // Illnesses CRUD
  async createIllness(animalId, illnessDto) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.post(`/Animal/${animalId}/illnesses`, illnessDto),
      { operation: 'create', entityType: 'illness', showSuccess: true, showError: true }
    )
  },

  async updateIllness(animalId, id, illnessDto) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.put(`/Animal/${animalId}/illnesses/${id}`, illnessDto),
      { operation: 'update', entityType: 'illness', showSuccess: true, showError: true }
    )
  },

  async deleteIllness(animalId, id) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.delete(`/Animal/${animalId}/illnesses/${id}`),
      { operation: 'delete', entityType: 'illness', showSuccess: true, showError: true }
    )
  },

  // Vaccines CRUD
  async createVaccine(animalId, vaccineDto) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.post(`/Animal/${animalId}/vaccines`, vaccineDto),
      { operation: 'create', entityType: 'vaccine', showSuccess: true, showError: true }
    )
  },

  async updateVaccine(animalId, id, vaccineDto) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.put(`/Animal/${animalId}/vaccines/${id}`, vaccineDto),
      { operation: 'update', entityType: 'vaccine', showSuccess: true, showError: true }
    )
  },

  async deleteVaccine(animalId, id) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.delete(`/Animal/${animalId}/vaccines/${id}`),
      { operation: 'delete', entityType: 'vaccine', showSuccess: true, showError: true }
    )
  },

  // ProductsUsed CRUD
  async createProductUsed(animalId, dto) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.post(`/Animal/${animalId}/productused`, dto),
      { operation: 'create', entityType: 'productused', showSuccess: true, showError: true }
    )
  },

  async updateProductUsed(animalId, id, dto) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.put(`/Animal/${animalId}/productused/${id}`, dto),
      { operation: 'update', entityType: 'productused', showSuccess: true, showError: true }
    )
  },

  async deleteProductUsed(animalId, id) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.delete(`/Animal/${animalId}/productused/${id}`),
      { operation: 'delete', entityType: 'productused', showSuccess: true, showError: true }
    )
  }
}

export default animalService
