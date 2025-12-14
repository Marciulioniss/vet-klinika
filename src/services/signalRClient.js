import * as signalR from '@microsoft/signalr'
import { notificationService } from './notificationService'
import apiClient from './api'

// Resolve SignalR hub URL
// Prefer explicit env var; fallback to API base without /api + default hub path
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')
// Your backend shows /chathub in logs, so default to that path
const DEFAULT_HUB = API_BASE.replace(/\/api$/, '') + '/chathub'
const HUB_URL = import.meta.env.VITE_SIGNALR_URL || DEFAULT_HUB

class SignalRClient {
  constructor() {
    this.connection = null
    this.connected = false
  }

  async start(token = null) {
    if (this.connected) return

    // Skip connecting if API health check fails
    try {
      const health = await apiClient.healthCheck()
      if (!health.success) {
        throw new Error('API nepasiekiama, SignalR nebus jungiamas')
      }
    } catch (e) {
      notificationService.addWarning('API nepasiekiama, SignalR išjungtas')
      return
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, token ? { accessTokenFactory: () => token } : undefined)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff with max 10s
          const base = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 10000)
          return base
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build()

    // Register handlers
    this.registerHandlers()

    try {
      await this.connection.start()
      this.connected = true
      console.log('SignalR connection established')
    } catch (err) {
      // Silent fail when backend is down - don't spam user with errors
      console.warn('SignalR connection failed (backend may be down):', err.message)
      this.connected = false
    }
  }

  registerHandlers() {
    if (!this.connection) return

    // Generic notification from backend
    this.connection.on('NotificationReceived', (payload) => {
      const { type = 'info', message = 'Naujas pranešimas', duration } = payload || {}
      switch (type) {
        case 'success':
          notificationService.addSuccess(message, { duration })
          break
        case 'error':
          notificationService.addError(message, { duration })
          break
        case 'warning':
          notificationService.addWarning(message, { duration })
          break
        default:
          notificationService.addInfo(message, { duration })
      }
    })

    // Example domain events
    this.connection.on('VisitUpdated', (visit) => {
      notificationService.addInfo(`Vizitas atnaujintas: ${visit?.doctorName || 'gydytojas'}`)
    })

    this.connection.on('PetRecordChanged', (pet) => {
      notificationService.addInfo(`Gyvūno duomenys atnaujinti: ${pet?.name || 'augintinis'}`)
    })
  }

  async stop() {
    if (this.connection && this.connected) {
      try {
        await this.connection.stop()
      } finally {
        this.connected = false
        this.connection = null
      }
    }
  }
}

export const signalRClient = new SignalRClient()
export default signalRClient
