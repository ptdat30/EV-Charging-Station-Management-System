import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import notificationService from './notificationService';

class GlobalMessageListener {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.userId = null;
        this.isCoach = false;
    }

    connect(userId, isCoach = false) {
        // Disconnect existing connection if any
        this.disconnect();
        
        this.userId = userId;
        this.isCoach = isCoach;
        
        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = new Client({
            webSocketFactory: () => socket,
            debug: () => {},
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.stompClient.onConnect = (frame) => {
            this.connected = true;
            
            if (isCoach) {
                // Coach: subscribe to all session topics using wildcard
                this.subscribeToAllSessions();
            }
            
            // Subscribe to user status updates
            const statusSubscription = this.stompClient.subscribe('/topic/user-status', (message) => {
                try {
                    const statusUpdate = JSON.parse(message.body);
                } catch (error) {
                    console.error('Error parsing user status message:', error);
                }
            });
        };

        this.stompClient.onStompError = (frame) => {
            this.connected = false;
        };

        this.stompClient.onWebSocketError = (error) => {
            this.connected = false;
        };

        this.stompClient.onWebSocketClose = () => {
            this.connected = false;
        };

        this.stompClient.activate();
    }

    subscribeToAllSessions() {
        if (!this.connected || !this.stompClient) {
            return;
        }

        // Subscribe to global messages topic for coaches
        const globalMessagesSubscription = this.stompClient.subscribe('/topic/global-messages', (message) => {
            try {
                const receivedMessage = JSON.parse(message.body);
                
                // Hiển thị thông báo nếu tin nhắn từ người khác
                if (receivedMessage.senderId && receivedMessage.senderId !== this.userId) {
                    const senderName = receivedMessage.senderName || receivedMessage.senderUsername || 'Người dùng';
                    notificationService.showNewMessageNotification(senderName, receivedMessage.sessionId);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
            this.connected = false;
            this.userId = null;
            this.isCoach = false;
        }
    }

    isConnected() {
        return this.connected;
    }
}

// Tạo instance singleton
const globalMessageListener = new GlobalMessageListener();
export default globalMessageListener; 