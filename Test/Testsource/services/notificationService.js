import { toast } from "react-toastify";

class NotificationService {
  constructor() {
    this.lastNotificationTime = 0;
    this.notificationCooldown = 5000; // 5 giây
    this.pendingNotifications = new Map(); // Lưu thông báo chờ hiển thị
  }

  // Hiển thị thông báo tin nhắn mới với giới hạn tần suất
  showNewMessageNotification(senderName, sessionId) {
    const now = Date.now();
    
    // Luôn thêm session vào danh sách unread, bất kể đang ở trang nào
    this.addUnreadSession(sessionId);
    
    // Kiểm tra xem có đang ở trang chat không
    const isOnChatPage = window.location.pathname === '/coach-consultation';
    if (isOnChatPage) {
      return; // Không hiển thị thông báo khi đang ở trang chat
    }

    // Kiểm tra cooldown
    if (now - this.lastNotificationTime < this.notificationCooldown) {
      // Nếu chưa đến lúc hiển thị, lưu vào danh sách chờ
      this.pendingNotifications.set(sessionId, {
        senderName,
        sessionId,
        timestamp: now
      });
      return;
    }

    // Hiển thị thông báo
    this.displayNotification(senderName, sessionId);
    this.lastNotificationTime = now;

    // Lên lịch hiển thị thông báo chờ sau 5 giây
    setTimeout(() => {
      this.showPendingNotifications();
    }, this.notificationCooldown);
  }

  // Hiển thị thông báo
  displayNotification(senderName, sessionId) {
    toast.info(`💬 Tin nhắn mới từ ${senderName}`, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onClick: () => {
        // Chuyển đến trang chat khi click
        window.location.href = '/coach-consultation';
      }
    });
  }

  // Hiển thị các thông báo chờ
  showPendingNotifications() {
    if (this.pendingNotifications.size === 0) {
      return;
    }

    const now = Date.now();
    const notificationsToShow = [];

    // Lấy tất cả thông báo chờ
    for (const [sessionId, notification] of this.pendingNotifications) {
      notificationsToShow.push(notification);
    }

    // Xóa danh sách chờ
    this.pendingNotifications.clear();

    if (notificationsToShow.length === 1) {
      // Chỉ có 1 thông báo
      const notification = notificationsToShow[0];
      this.displayNotification(notification.senderName, notification.sessionId);
    } else {
      // Có nhiều thông báo, hiển thị tổng hợp
      const uniqueSenders = [...new Set(notificationsToShow.map(n => n.senderName))];
      if (uniqueSenders.length === 1) {
        // Tất cả từ cùng 1 người
        toast.info(`💬 ${notificationsToShow.length} tin nhắn mới từ ${uniqueSenders[0]}`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClick: () => {
            window.location.href = '/coach-consultation';
          }
        });
      } else {
        // Từ nhiều người khác nhau
        toast.info(`💬 ${notificationsToShow.length} tin nhắn mới từ ${uniqueSenders.length} người dùng`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClick: () => {
            window.location.href = '/coach-consultation';
          }
        });
      }
    }

    this.lastNotificationTime = now;
  }

  // Reset cooldown (có thể gọi khi user chuyển trang)
  resetCooldown() {
    this.lastNotificationTime = 0;
  }

  // Xóa tất cả thông báo chờ
  clearPendingNotifications() {
    this.pendingNotifications.clear();
  }

  // Lưu sessionId có tin nhắn mới vào localStorage
  addUnreadSession(sessionId) {
    let unread = JSON.parse(localStorage.getItem('unreadSessions') || '[]');
    if (!unread.includes(sessionId)) {
      unread.push(sessionId);
      localStorage.setItem('unreadSessions', JSON.stringify(unread));
      
      // Dispatch event để thông báo component cập nhật
      window.dispatchEvent(new CustomEvent('unreadSessionsUpdate'));
    }
  }

  // Xóa sessionId khỏi danh sách unread
  removeUnreadSession(sessionId) {
    let unread = JSON.parse(localStorage.getItem('unreadSessions') || '[]');
    unread = unread.filter(id => id !== sessionId);
    localStorage.setItem('unreadSessions', JSON.stringify(unread));
    
    // Dispatch event để thông báo component cập nhật
    window.dispatchEvent(new CustomEvent('unreadSessionsUpdate'));
  }

  // Lấy danh sách unread
  getUnreadSessions() {
    return JSON.parse(localStorage.getItem('unreadSessions') || '[]');
  }
}

// Tạo instance singleton
const notificationService = new NotificationService();
export default notificationService; 