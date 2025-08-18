const WebSocket = require('ws');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Set();
    
    this.wss.on('connection', (ws) => {
      console.log('클라이언트 WebSocket 연결됨');
      this.clients.add(ws);

      ws.on('close', () => {
        console.log('클라이언트 WebSocket 연결 종료');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket 오류:', error);
        this.clients.delete(ws);
      });

      // 연결 시 환영 메시지
      this.sendToClient(ws, {
        type: 'connected',
        data: { message: '실시간 업데이트 연결됨' }
      });
    });
  }

  // 특정 클라이언트에게 메시지 전송
  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // 모든 클라이언트에게 브로드캐스트
  broadcast(message) {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      } else {
        this.clients.delete(ws);
      }
    });

    console.log(`${this.clients.size}명의 클라이언트에게 메시지 브로드캐스트:`, message.type);
  }

  // 새로운 채용공고 알림
  notifyJobAdded(job) {
    this.broadcast({
      type: 'job_added',
      data: job
    });
  }

  // 채용공고 업데이트 알림
  notifyJobUpdated(job) {
    this.broadcast({
      type: 'job_updated',
      data: job
    });
  }

  // 채용공고 삭제 알림
  notifyJobDeleted(jobId) {
    this.broadcast({
      type: 'job_deleted',
      data: { id: jobId }
    });
  }

  // 통계 업데이트 알림
  notifyStatsUpdated(stats) {
    this.broadcast({
      type: 'stats_updated',
      data: stats
    });
  }

  // 크롤링 상태 알림
  notifyCrawlingStatus(status) {
    this.broadcast({
      type: 'crawling_status',
      data: status
    });
  }

  // 연결된 클라이언트 수 반환
  getClientCount() {
    return this.clients.size;
  }
}

module.exports = WebSocketServer;