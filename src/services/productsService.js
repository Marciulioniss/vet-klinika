import apiClient from './api'

const productsService = {
  async getProducts() {
    // Use configured API base URL and call /Product
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5068/api').replace(/\/$/, '')
    const resp = await fetch(`${base}/Product`, {
      headers: { 'Content-Type': 'application/json' }
    })
    if (!resp.ok) throw new Error('Nepavyko įkelti produktų')
    return await resp.json()
  }
}

export default productsService
