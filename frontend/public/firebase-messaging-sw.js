/* eslint-env serviceworker */
// eslint-disable-next-line no-redeclare
/* global importScripts, firebase, clients, self */

// firebase-messaging-sw.js
// Service Worker for Firebase Cloud Messaging
// This file must be in the public folder and will be served from the root

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAI7Xn5w_v2WM_q9xN3EnhzWsfBHqUIUek",
  authDomain: "ev-charging-station-61bdc.firebaseapp.com",
  projectId: "ev-charging-station-61bdc",
  storageBucket: "ev-charging-station-61bdc.firebasestorage.app",
  messagingSenderId: "806288319553",
  appId: "1:806288319553:web:2118e285baec7f142d52c0",
  measurementId: "G-HW49E2ZWNW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Background message received:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || '',
    icon: '/vite.svg', // You can customize this
    badge: '/vite.svg',
    tag: `notification-${payload.data?.notificationId || Date.now()}`,
    data: payload.data,
    requireInteraction: false,
    silent: false
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification);

  event.notification.close();

  // Get the notification data
  const notificationData = event.notification.data;

  // Determine the URL to open based on notification type
  let urlToOpen = '/';
  
  if (notificationData) {
    const { notificationType, referenceId } = notificationData;
    
    switch (notificationType) {
      case 'charging_started':
      case 'charging_complete':
      case 'charging_failed':
        urlToOpen = referenceId ? `/sessions/${referenceId}` : '/sessions';
        break;
      case 'payment_success':
      case 'payment_failed':
        urlToOpen = '/payment';
        break;
      case 'reservation_confirmed':
      case 'reservation_reminder':
      case 'reservation_cancelled':
        urlToOpen = '/reservations';
        break;
      case 'wallet_low_balance':
        urlToOpen = '/wallet';
        break;
      default:
        urlToOpen = '/';
    }
  }

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notification closed:', event.notification);
});

