interface JobUpdate {
  type: 'job_added' | 'job_updated' | 'job_deleted' | 'stats_updated'
  data: any
}

class WebSocketManager {
  private ws: WebSocket | null = null
  private listeners: { [key: string]: Function[] } = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect() {
    try {
      this.ws = new WebSocket('ws://localhost:3001/ws')
      
      this.ws.onopen = () => {
        console.log('WebSocket 연결됨')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const update: JobUpdate = JSON.parse(event.data)
          this.emit(update.type, update.data)
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket 연결 종료')
        this.reconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket 오류:', error)
      }
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      this.reconnect()
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`WebSocket 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export const wsManager = new WebSocketManager()

// React Hook for WebSocket
export function useWebSocket() {
  const connect = () => wsManager.connect()
  const disconnect = () => wsManager.disconnect()
  const on = (event: string, callback: Function) => wsManager.on(event, callback)
  const off = (event: string, callback: Function) => wsManager.off(event, callback)

  return { connect, disconnect, on, off }
}