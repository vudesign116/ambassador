/**
 * Config Update Event Utility
 * Triggers events when admin updates configuration
 * Allows user pages to reload config in real-time
 */

// Event name constants
export const CONFIG_EVENTS = {
  LOGIN_PAGE_UPDATED: 'login_page_config_updated',
  SCORING_RULES_UPDATED: 'scoring_rules_config_updated',
  INTRODUCTION_UPDATED: 'introduction_config_updated',
  DASHBOARD_UPDATED: 'dashboard_config_updated',
  GENERAL_UPDATED: 'general_config_updated',
  NOTIFICATION_UPDATED: 'notification_config_updated',
};

/**
 * Dispatch a config update event
 * @param {string} eventName - Event name from CONFIG_EVENTS
 * @param {object} detail - Additional data to pass with event
 */
export const dispatchConfigUpdate = (eventName, detail = {}) => {
  const event = new CustomEvent(eventName, { 
    detail: {
      timestamp: Date.now(),
      ...detail
    }
  });
  window.dispatchEvent(event);
  console.log(`📢 Config update event dispatched: ${eventName}`, detail);
};

/**
 * Listen for config update events
 * @param {string} eventName - Event name from CONFIG_EVENTS
 * @param {function} callback - Callback function when event fires
 * @returns {function} Cleanup function to remove listener
 */
export const onConfigUpdate = (eventName, callback) => {
  const handler = (event) => {
    console.log(`🔔 Config update received: ${eventName}`, event.detail);
    callback(event.detail);
  };
  
  window.addEventListener(eventName, handler);
  
  // Return cleanup function
  return () => {
    window.removeEventListener(eventName, handler);
  };
};

/**
 * Force reload a config from localStorage
 * @param {string} configKey - localStorage key
 * @returns {object|null} Parsed config or null
 */
export const reloadConfig = (configKey) => {
  try {
    const configString = localStorage.getItem(configKey);
    if (!configString) {
      console.log(`ℹ️ No config found for key: ${configKey}`);
      return null;
    }
    
    const config = JSON.parse(configString);
    console.log(`✅ Config reloaded from localStorage: ${configKey}`);
    return config;
  } catch (error) {
    console.error(`❌ Error reloading config ${configKey}:`, error);
    return null;
  }
};

export default {
  CONFIG_EVENTS,
  dispatchConfigUpdate,
  onConfigUpdate,
  reloadConfig
};
