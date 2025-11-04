/**
 * Firebase Configuration Template
 * 
 * HƯỚNG DẪN:
 * 1. Copy file này và thay thế nội dung vào frontend/src/config/firebase.js
 * 2. Lấy Firebase config từ Firebase Console > Project Settings > General > Your apps
 * 3. Lấy VAPID key từ Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
 * 
 * Xem chi tiết trong file FIREBASE_SETUP.md
 */

// ============================================
// BƯỚC 1: LẤY FIREBASE CONFIG
// ============================================
// Vào Firebase Console > Project Settings > General
// Scroll xuống phần "Your apps" > Chọn Web app của bạn
// Copy object firebaseConfig dưới đây

const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",           // ← Thay bằng API key của bạn
  authDomain: "your-project-id.firebaseapp.com",            // ← Thay bằng auth domain của bạn
  projectId: "your-project-id",                              // ← Thay bằng project ID của bạn
  storageBucket: "your-project-id.appspot.com",             // ← Thay bằng storage bucket của bạn
  messagingSenderId: "123456789012",                        // ← Thay bằng messaging sender ID của bạn
  appId: "1:123456789012:web:abcdef1234567890",             // ← Thay bằng app ID của bạn
  measurementId: "G-XXXXXXXXXX"                            // ← Thay bằng measurement ID của bạn (optional)
};

// ============================================
// BƯỚC 2: LẤY VAPID KEY
// ============================================
// Vào Firebase Console > Project Settings > Cloud Messaging
// Tìm phần "Web Push certificates"
// Nếu chưa có, click "Generate key pair"
// Copy VAPID key (sẽ là một chuỗi dài bắt đầu bằng chữ cái)

const vapidKey = "BXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // ← Thay bằng VAPID key của bạn

// ============================================
// VÍ DỤ HOÀN CHỈNH:
// ============================================
/*
const firebaseConfig = {
  apiKey: "AIzaSyAbCdEfGhIjKlMnO pQrStUvWxYz1234567",
  authDomain: "ev-charging-station.firebaseapp.com",
  projectId: "ev-charging-station",
  storageBucket: "ev-charging-station.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:1234567890abcdef",
  measurementId: "G-ABCDEF1234"
};

const vapidKey = "BHxYz1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
*/

// ============================================
// LƯU Ý:
// ============================================
// - KHÔNG commit file này lên Git với thông tin thật
// - Sử dụng environment variables trong production
// - Giữ VAPID key bí mật, không chia sẻ công khai

