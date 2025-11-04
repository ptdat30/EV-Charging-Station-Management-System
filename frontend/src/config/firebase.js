// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

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

// VAPID key for web push notifications
// Get this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const vapidKey = "BKYDjP2mQ5oQX4QVlCptHTLXhVUELkjLQzODbZRacd47DQ3aRtpyjFKoIUXER4A48WRBMy-WyDlFsQHOib7aHoM";

// Initialize Firebase
let app;
let messaging = null;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// Register service worker for background notifications
const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    console.log('✅ Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
};

// Initialize messaging service (only in browser and if supported)
const initializeMessaging = async () => {
  if (typeof window === 'undefined') {
    console.warn('⚠️ Messaging can only be initialized in browser environment');
    return null;
  }

  try {
    // Register service worker first
    await registerServiceWorker();

    // Check if Firebase Messaging is supported
    const isSupportedResult = await isSupported();
    if (!isSupportedResult) {
      console.warn('⚠️ Firebase Messaging is not supported in this browser');
      return null;
    }

    if (!messaging && app) {
      messaging = getMessaging(app);
      console.log('✅ Firebase Messaging initialized');
    }
    return messaging;
  } catch (error) {
    console.error('❌ Error initializing Firebase Messaging:', error);
    return null;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  const messagingInstance = await initializeMessaging();
  if (!messagingInstance) {
    console.warn('⚠️ Messaging not initialized');
    return null;
  }

  try {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('⚠️ This browser does not support notifications');
      return null;
    }

    // Check current permission
    let permission = Notification.permission;
    
    if (permission === 'default') {
      // Request permission
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return await getFCMToken();
    } else if (permission === 'denied') {
      console.warn('⚠️ Notification permission denied by user');
      return null;
    } else {
      console.warn('⚠️ Notification permission:', permission);
      return null;
    }
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return null;
  }
};

// Get FCM token
export const getFCMToken = async () => {
  const messagingInstance = await initializeMessaging();
  if (!messagingInstance) {
    console.warn('⚠️ Messaging not initialized');
    return null;
  }

  if (!vapidKey || vapidKey === 'YOUR_VAPID_KEY') {
    console.error('❌ VAPID key not configured. Please set your VAPID key in firebase.js');
    return null;
  }

  try {
    const currentToken = await getToken(messagingInstance, { vapidKey });
    if (currentToken) {
      console.log('✅ FCM Token retrieved:', currentToken.substring(0, 20) + '...');
      return currentToken;
    } else {
      console.warn('⚠️ No registration token available.');
      console.log('💡 Make sure you have granted notification permission and service worker is registered');
      return null;
    }
  } catch (error) {
    console.error('❌ An error occurred while retrieving token:', error);
    
    // Provide helpful error messages
    if (error.code === 'messaging/permission-blocked') {
      console.error('💡 Notification permission is blocked. Please enable it in browser settings.');
    } else if (error.code === 'messaging/registration-token-not-registered') {
      console.error('💡 Token not registered. Please request permission again.');
    }
    
    return null;
  }
};

// Listen for foreground messages (when app is open)
export const onMessageListener = () => {
  return new Promise(async (resolve) => {
    const messagingInstance = await initializeMessaging();
    if (!messagingInstance) {
      resolve(null);
      return;
    }

    onMessage(messagingInstance, (payload) => {
      console.log('📨 Foreground message received:', payload);
      resolve(payload);
    });
  });
};

// Delete FCM token (for logout)
export const deleteFCMToken = async () => {
  const messagingInstance = await initializeMessaging();
  if (!messagingInstance) {
    return false;
  }

  try {
    // Note: Firebase doesn't have a direct deleteToken method
    // The token will be invalidated when user unregisters on backend
    console.log('ℹ️ Token deletion should be handled on backend');
    return true;
  } catch (error) {
    console.error('❌ Error deleting FCM token:', error);
    return false;
  }
};

// Get messaging instance
export const getMessagingInstance = async () => {
  return await initializeMessaging();
};

export { app, messaging };

