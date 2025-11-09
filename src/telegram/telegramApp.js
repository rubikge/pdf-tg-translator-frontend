/**
 * Telegram Mini App Integration Module
 * Handles Telegram WebApp API interactions
 */

let tg = null;

/**
 * Initialize Telegram WebApp
 * Must be called before using any Telegram features
 * @returns {boolean} True if initialized successfully
 */
export function initTelegramApp() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    tg = window.Telegram.WebApp;
    
    // Expand app to full screen
    tg.expand();
    
    // Enable closing confirmation
    tg.enableClosingConfirmation();
    
    // Set header color (Tailwind gray-800)
    tg.setHeaderColor('#1f2937');
    
    // Set background color
    tg.setBackgroundColor('#ffffff');
    
    // Ready signal
    tg.ready();
    
    console.log('Telegram WebApp initialized', {
      version: tg.version,
      platform: tg.platform,
      colorScheme: tg.colorScheme,
      user: tg.initDataUnsafe?.user
    });
    
    return true;
  }
  
  console.warn('Telegram WebApp API not available - running in browser mode');
  return false;
}

/**
 * Get Telegram WebApp instance
 * @returns {object|null} Telegram WebApp instance
 */
export function getTelegramApp() {
  return tg;
}

/**
 * Check if running inside Telegram
 * @returns {boolean}
 */
export function isTelegramEnvironment() {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}

/**
 * Get Telegram user data
 * @returns {object|null} User object with id, first_name, last_name, username, language_code
 */
export function getTelegramUser() {
  if (!tg) return null;
  return tg.initDataUnsafe?.user || null;
}

/**
 * Get Telegram init data (for backend authentication)
 * @returns {string|null} Init data string for verification
 */
export function getTelegramInitData() {
  if (!tg) return null;
  return tg.initData || null;
}

/**
 * Show main button (for actions)
 * @param {string} text - Button text
 * @param {function} onClick - Click handler
 */
export function showMainButton(text, onClick) {
  if (!tg) return;
  
  tg.MainButton.setText(text);
  tg.MainButton.show();
  tg.MainButton.onClick(onClick);
}

/**
 * Hide main button
 */
export function hideMainButton() {
  if (!tg) return;
  tg.MainButton.hide();
}

/**
 * Update main button text
 * @param {string} text - New button text
 */
export function setMainButtonText(text) {
  if (!tg) return;
  tg.MainButton.setText(text);
}

/**
 * Enable/disable main button
 * @param {boolean} enabled - Whether button should be enabled
 */
export function setMainButtonEnabled(enabled) {
  if (!tg) return;
  if (enabled) {
    tg.MainButton.enable();
  } else {
    tg.MainButton.disable();
  }
}

/**
 * Show back button
 * @param {function} onClick - Click handler
 */
export function showBackButton(onClick) {
  if (!tg) return;
  
  tg.BackButton.show();
  tg.BackButton.onClick(onClick);
}

/**
 * Hide back button
 */
export function hideBackButton() {
  if (!tg) return;
  tg.BackButton.hide();
}

/**
 * Show alert
 * @param {string} message - Alert message
 * @param {function} callback - Optional callback when alert is closed
 */
export function showAlert(message, callback) {
  if (!tg) {
    alert(message);
    if (callback) callback();
    return;
  }
  tg.showAlert(message, callback);
}

/**
 * Show confirm dialog
 * @param {string} message - Confirmation message
 * @param {function} callback - Callback with result (true/false)
 */
export function showConfirm(message, callback) {
  if (!tg) {
    const result = confirm(message);
    callback(result);
    return;
  }
  tg.showConfirm(message, callback);
}

/**
 * Show popup with buttons
 * @param {string} title - Popup title
 * @param {string} message - Popup message
 * @param {Array} buttons - Array of button objects {id, type, text}
 * @param {function} callback - Callback with button id
 */
export function showPopup(title, message, buttons, callback) {
  if (!tg) {
    showAlert(`${title}\n${message}`, callback);
    return;
  }
  tg.showPopup({
    title,
    message,
    buttons
  }, callback);
}

/**
 * Close Mini App
 */
export function closeTelegramApp() {
  if (!tg) return;
  tg.close();
}

/**
 * Send data to bot
 * @param {object} data - Data to send (will be stringified)
 */
export function sendDataToBot(data) {
  if (!tg) {
    console.error('Telegram WebApp not available');
    return;
  }
  
  tg.sendData(JSON.stringify(data));
}

/**
 * Open link in Telegram browser
 * @param {string} url - URL to open
 */
export function openTelegramLink(url) {
  if (!tg) {
    window.open(url, '_blank');
    return;
  }
  tg.openTelegramLink(url);
}

/**
 * Open external link
 * @param {string} url - URL to open
 */
export function openLink(url) {
  if (!tg) {
    window.open(url, '_blank');
    return;
  }
  tg.openLink(url);
}

/**
 * Haptic feedback
 * @param {string} type - Feedback type: 'impact', 'notification', 'selection'
 * @param {string} style - Style for impact: 'light', 'medium', 'heavy', 'rigid', 'soft'
 */
export function hapticFeedback(type = 'impact', style = 'medium') {
  if (!tg || !tg.HapticFeedback) return;
  
  switch (type) {
    case 'impact':
      tg.HapticFeedback.impactOccurred(style);
      break;
    case 'notification':
      tg.HapticFeedback.notificationOccurred(style); // 'error', 'success', 'warning'
      break;
    case 'selection':
      tg.HapticFeedback.selectionChanged();
      break;
  }
}

/**
 * Request write access (for sending messages to bot)
 * @param {function} callback - Callback with result (true/false)
 */
export function requestWriteAccess(callback) {
  if (!tg) {
    callback(false);
    return;
  }
  tg.requestWriteAccess(callback);
}

/**
 * Request contact (phone number)
 * @param {function} callback - Callback with result (true/false)
 */
export function requestContact(callback) {
  if (!tg) {
    callback(false);
    return;
  }
  tg.requestContact(callback);
}

/**
 * Get color scheme (light/dark)
 * @returns {string} 'light' or 'dark'
 */
export function getColorScheme() {
  if (!tg) return 'light';
  return tg.colorScheme;
}

/**
 * Get theme parameters
 * @returns {object} Theme parameters object
 */
export function getThemeParams() {
  if (!tg) return {};
  return tg.themeParams;
}

/**
 * Set header color
 * @param {string} color - Color in hex format or 'bg_color' or 'secondary_bg_color'
 */
export function setHeaderColor(color) {
  if (!tg) return;
  tg.setHeaderColor(color);
}

/**
 * Set background color
 * @param {string} color - Color in hex format
 */
export function setBackgroundColor(color) {
  if (!tg) return;
  tg.setBackgroundColor(color);
}

/**
 * Read text from clipboard
 * @param {function} callback - Callback with clipboard text
 */
export function readTextFromClipboard(callback) {
  if (!tg) {
    navigator.clipboard.readText()
      .then(callback)
      .catch(() => callback(''));
    return;
  }
  tg.readTextFromClipboard(callback);
}

/**
 * Get query parameters from start_param
 * @returns {URLSearchParams}
 */
export function getStartParam() {
  if (!tg) return new URLSearchParams();
  const startParam = tg.initDataUnsafe?.start_param || '';
  return new URLSearchParams(startParam);
}

/**
 * Check if app is expanded
 * @returns {boolean}
 */
export function isExpanded() {
  if (!tg) return true;
  return tg.isExpanded;
}

/**
 * Get viewport height
 * @returns {number}
 */
export function getViewportHeight() {
  if (!tg) return window.innerHeight;
  return tg.viewportHeight;
}

/**
 * Get viewport stable height
 * @returns {number}
 */
export function getViewportStableHeight() {
  if (!tg) return window.innerHeight;
  return tg.viewportStableHeight;
}

