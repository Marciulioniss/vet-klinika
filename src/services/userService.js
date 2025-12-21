import apiClient from './api'
import { apiWrapper, notificationService } from './notificationService'

// Vartotojo API funkcijos su pagerintu pranešimų valdymu
export const userService = {
  // Gauti vartotojo profilį
  async getProfile(showNotifications = false) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.get('/Users/me'),
      {
        operation: 'fetch',
        entityType: 'user',
        showSuccess: showNotifications,
        showError: true,
        successMessage: showNotifications ? 'Profilio duomenys sėkmingai įkelti' : null
      }
    )
  },

  // Atnaujinti vartotojo profilį
  async updateProfile(userData) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.put('/Users/me', userData),
      {
        operation: 'update',
        entityType: 'user',
        showSuccess: true,
        showError: true,
        successMessage: 'Profilio duomenys sėkmingai atnaujinti'
      }
    )
  },

  // Keisti slaptažodį
  async changePassword(passwordData) {
    return await apiWrapper.executeWithNotification(
      () => apiClient.put('/Users/me/password', passwordData),
      {
        operation: 'update',
        entityType: 'slaptažodis',
        showSuccess: true,
        showError: true,
        successMessage: 'Slaptažodis sėkmingai pakeistas'
      }
    )
  },

  // Ištrinti paskyrą su patvirtinimu
  async deleteAccount() {
    const confirmed = window.confirm(
      'Ar tikrai norite ištrinti savo paskyrą? Šis veiksmas neatšaukiamas.'
    )

    if (!confirmed) {
      notificationService.addInfo('Paskyros trynimas atšauktas')
      return { success: false, cancelled: true }
    }

    return await apiWrapper.executeWithNotification(
      () => apiClient.delete('/Users/me'),
      {
        operation: 'delete',
        entityType: 'paskyra',
        showSuccess: true,
        showError: true,
        successMessage: 'Paskyra sėkmingai ištrinta'
      }
    )
  },

  // Gauti vartotojo gyvūnus
  async getMyAnimals() {
    return await apiWrapper.executeWithNotification(
      () => apiClient.get('/Users/me/animals'),
      {
        operation: 'fetch',
        entityType: 'animals',
        showSuccess: false,
        showError: true,
        errorMessage: 'Nepavyko įkelti jūsų gyvūnų'
      }
    )
  }
}

export default userService