// src/utils/modalUtils.js
// Utility functions to help with modal state management

/**
 * Helper to determine alert type from message
 */
export const getAlertType = (message) => {
  if (!message) return 'info';
  const msg = message.toLowerCase();
  if (msg.includes('✅') || msg.includes('thành công') || msg.includes('success')) {
    return 'success';
  }
  if (msg.includes('❌') || msg.includes('lỗi') || msg.includes('error') || msg.includes('thất bại')) {
    return 'error';
  }
  if (msg.includes('⚠️') || msg.includes('cảnh báo') || msg.includes('warning')) {
    return 'warning';
  }
  return 'info';
};

/**
 * Extract title from message (first line or emoji-based)
 */
export const extractTitle = (message, defaultTitle = 'Thông báo') => {
  if (!message) return defaultTitle;
  const lines = message.split('\n');
  const firstLine = lines[0].trim();
  
  // If first line has emoji and is short, use it as title
  if (firstLine.length < 50 && (firstLine.includes('✅') || firstLine.includes('❌') || firstLine.includes('⚠️'))) {
    return firstLine;
  }
  
  return defaultTitle;
};

/**
 * Clean message (remove emoji from body if used in title)
 */
export const cleanMessage = (message) => {
  if (!message) return '';
  const lines = message.split('\n');
  const firstLine = lines[0].trim();
  
  // If first line looks like a title, remove it from message
  if (firstLine.length < 50 && (firstLine.includes('✅') || firstLine.includes('❌') || firstLine.includes('⚠️'))) {
    return lines.slice(1).join('\n').trim() || firstLine;
  }
  
  return message;
};

