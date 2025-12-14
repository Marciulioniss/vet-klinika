import apiClient from './api'
import { apiWrapper } from './notificationService'

// Gyvūnų (augintinių) API funkcijos
export const petsService = {
  // Gauti visus vartotojo gyvūnus
  async getPets(showNotifications = false) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.get('/pets'),
      {
        operation: 'fetch',
        entityType: 'gyvūnai',
        showSuccess: false,
        showError: showNotifications,
        errorMessage: 'Nepavyko įkelti gyvūnų duomenų'
      }
    )
  },

  // Gauti konkretų gyvūną
  async getPet(petId, showNotifications = false) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.get(`/pets/${petId}`),
      {
        operation: 'fetch',
        entityType: 'gyvūnas',
        showSuccess: false,
        showError: showNotifications
      }
    )
  },

  // Pridėti naują gyvūną
  async addPet(petData) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.post('/pets', petData),
      {
        operation: 'create',
        entityType: 'gyvūnas',
        showSuccess: true,
        showError: true,
        successMessage: 'Gyvūnas sėkmingai pridėtas'
      }
    )
  },

  // Atnaujinti gyvūno duomenis
  async updatePet(petId, petData) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.put(`/pets/${petId}`, petData),
      {
        operation: 'update',
        entityType: 'gyvūnas',
        showSuccess: true,
        showError: true,
        successMessage: 'Gyvūno duomenys atnaujinti'
      }
    )
  },

  // Ištrinti gyvūną
  async deletePet(petId) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.delete(`/pets/${petId}`),
      {
        operation: 'delete',
        entityType: 'gyvūnas',
        showSuccess: true,
        showError: true,
        successMessage: 'Gyvūnas pašalintas iš sistemos'
      }
    )
  },

  // Gauti gyvūno sveikatos istoriją
  async getPetHealthHistory(petId) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.get(`/pets/${petId}/health-history`),
      {
        operation: 'fetch',
        entityType: 'sveikatos istorija',
        showSuccess: false,
        showError: true
      }
    )
  },

  // Gauti gyvūno vizitus
  async getPetVisits(petId) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.get(`/pets/${petId}/visits`),
      {
        operation: 'fetch',
        entityType: 'vizitai',
        showSuccess: false,
        showError: true
      }
    )
  }
}

export default petsService
