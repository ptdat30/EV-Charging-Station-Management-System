import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import notificationService from './notificationService';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.subscriptions = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.heartbeatInterval = null;
    }

    connect(userId, sessionId, onMessageReceived) {
        // Disconnect existing connection if any
        this.disconnect();
        
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
            this.reconnectAttempts = 0;
            
            // Subscribe to session topic
            const sessionSubscription = this.stompClient.subscribe(`/topic/session.${sessionId}`, (message) => {
                try {
                    const receivedMessage = JSON.parse(message.body);
                    
                    // Gọi callback function để xử lý tin nhắn
                    onMessageReceived(receivedMessage);
                    
                    // Hiển thị thông báo nếu tin nhắn từ người khác
                    if (receivedMessage.senderId && receivedMessage.senderId !== userId) {
                        const senderName = receivedMessage.senderName || receivedMessage.senderUsername || 'Người dùng';
                        notificationService.showNewMessageNotification(senderName, receivedMessage.sessionId);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });
            
            this.subscriptions.set(sessionId, sessionSubscription);
            
            // Subscribe to user status updates (for admin panel)
            const statusSubscription = this.stompClient.subscribe('/topic/user-status', (message) => {
                try {
                    // Dispatch a custom event for user status updates
                    window.dispatchEvent(new CustomEvent('userStatusUpdate', { 
                        detail: JSON.parse(message.body) 
                    }));
                } catch (error) {
                    console.error('Error parsing user status message:', error);
                }
            });
            
            this.subscriptions.set('user-status', statusSubscription);
            
            // Start heartbeat for user activity tracking
            this.startHeartbeat(userId);
        };

        this.stompClient.onStompError = (frame) => {
            console.error('WebSocketService: Broker reported error: ' + frame.headers['message']);
            console.error('WebSocketService: Additional details: ' + frame.body);
            this.connected = false;
        };

        this.stompClient.onWebSocketError = (error) => {
            console.error('WebSocketService: WebSocket error:', error);
            this.connected = false;
        };

        this.stompClient.onWebSocketClose = () => {
            console.log('WebSocketService: WebSocket connection closed');
            this.connected = false;
            this.stopHeartbeat();
            
            // Chỉ reconnect nếu không phải do disconnect thủ công và chưa vượt quá số lần thử
            if (this.reconnectAttempts < this.maxReconnectAttempts && this.stompClient) {
                this.reconnectAttempts++;
                setTimeout(() => {
                    // Kiểm tra lại trước khi reconnect để tránh reconnect không cần thiết
                    if (this.stompClient && !this.connected) {
                        this.connect(userId, sessionId, onMessageReceived);
                    }
                }, 5000);
            } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.log('WebSocketService: Max reconnection attempts reached. Stopping reconnection.');
            }
        };

        this.stompClient.activate();
    }

    disconnect() {
        if (this.stompClient) {
            // Unsubscribe from all topics
            this.subscriptions.forEach((subscription) => {
                try {
                    subscription.unsubscribe();
                } catch (error) {
                    console.error('Error unsubscribing:', error);
                }
            });
            this.subscriptions.clear();
            
            this.stompClient.deactivate();
            this.connected = false;
            this.reconnectAttempts = 0;
        }
    }

    sendMessage(sessionId, senderId, content, messageType, senderName, senderUsername) {
        if (this.connected && this.stompClient) {
            try {
                const messageBody = {
                    sessionId: sessionId,
                    senderId: senderId,
                    content: content,
                    messageType: messageType,
                    senderName: senderName,
                    senderUsername: senderUsername
                };
                this.stompClient.publish({
                    destination: '/app/chat.sendMessage',
                    body: JSON.stringify(messageBody)
                });
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
            }
        } else {
            console.warn('WebSocket not connected. Cannot send message.');
        }
    }

    joinSession(sessionId, senderId, senderName, senderUsername) {
        if (this.connected && this.stompClient) {
            try {
                this.stompClient.publish({
                    destination: '/app/chat.addUser',
                    body: JSON.stringify({
                        sessionId: sessionId,
                        senderId: senderId,
                        senderName: senderName,
                        senderUsername: senderUsername
                    })
                });
            } catch (error) {
                console.error('Error joining WebSocket session:', error);
            }
        } else {
            console.warn('WebSocket not connected. Cannot join session.');
        }
    }

    isConnected() {
        return this.connected;
    }

    subscribeToUserStatus(onStatusUpdate) {
        if (this.connected && this.stompClient) {
            const subscription = this.stompClient.subscribe('/topic/user-status', (message) => {
                try {
                    onStatusUpdate(JSON.parse(message.body));
                } catch (error) {
                    console.error('Error parsing user status message:', error);
                }
            });
            
            this.subscriptions.set('manual-user-status', subscription);
            return subscription;
        } else {
            console.warn('WebSocket not connected. Cannot subscribe to user status.');
            return null;
        }
    }

    startHeartbeat(userId) {
        // Send heartbeat immediately when connected
        if (this.connected && this.stompClient) {
            this.stompClient.publish({
                destination: '/app/user.heartbeat',
                body: JSON.stringify({
                    senderId: userId,
                    messageType: 'heartbeat'
                })
            });
        }
        
        // Send heartbeat every 5 minutes to track user activity
        this.heartbeatInterval = setInterval(() => {
            if (this.connected && this.stompClient) {
                // Chỉ log khi cần debug, không log mỗi lần heartbeat
                this.stompClient.publish({
                    destination: '/app/user.heartbeat',
                    body: JSON.stringify({
                        senderId: userId,
                        messageType: 'heartbeat'
                    })
                });
            }
        }, 300000); // 5 minutes = 300000ms
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
}

export default new WebSocketService(); 