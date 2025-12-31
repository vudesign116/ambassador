/**
 * Config Sync Utility
 * Automatically syncs admin config between localStorage and Google Sheets
 * for cross-device compatibility
 */

import { googleSheetsService } from '../services/googleSheetsService';
import { dispatchConfigUpdate, CONFIG_EVENTS } from './configEvents';

/**
 * List of all admin config keys that need cross-device sync
 */
export const ADMIN_CONFIG_KEYS = [
  'admin_login_page_config',
  'admin_introduction_config',
  'admin_scoring_rules_config',
  'admin_badges_config',
  'admin_notification_config',
  'admin_survey_config',
  'admin_mini_games_config',
  'admin_general_config'
];

/**
 * Save config to both localStorage and Google Sheets
 * @param {string} configKey - Config key (e.g., 'admin_login_page_config')
 * @param {object} configData - Config data to save
 * @returns {Promise<boolean>} - Success status
 */
export const saveConfig = async (configKey, configData) => {
  try {
    // 1. Save to localStorage (fast, local access)
    localStorage.setItem(configKey, JSON.stringify(configData));
    console.log(`💾 Saved to localStorage: ${configKey}`);

    // 2. Save to Google Sheets (cross-device sync)
    const sheetSuccess = await googleSheetsService.saveAdminConfig(configKey, configData);
    
    if (sheetSuccess) {
      console.log(`☁️ Synced to Google Sheets: ${configKey}`);
    } else {
      console.warn(`⚠️ Failed to sync to Google Sheets: ${configKey} (localStorage only)`);
    }

    // 3. Dispatch event for real-time updates
    const eventMap = {
      'admin_login_page_config': CONFIG_EVENTS.LOGIN_PAGE_UPDATED,
      'admin_introduction_config': CONFIG_EVENTS.INTRODUCTION_UPDATED,
      'admin_scoring_rules_config': CONFIG_EVENTS.SCORING_RULES_UPDATED,
      'admin_badges_config': CONFIG_EVENTS.BADGES_UPDATED,
      'admin_notification_config': CONFIG_EVENTS.NOTIFICATION_UPDATED,
      'admin_general_config': CONFIG_EVENTS.GENERAL_UPDATED
    };

    if (eventMap[configKey]) {
      dispatchConfigUpdate(eventMap[configKey], {
        configData,
        timestamp: Date.now()
      });
    }

    return true;
  } catch (error) {
    console.error(`❌ Error saving config ${configKey}:`, error);
    return false;
  }
};

/**
 * Load config from Google Sheets (cross-device) or localStorage (fallback)
 * @param {string} configKey - Config key to load
 * @returns {Promise<object|null>} - Config data or null
 */
export const loadConfig = async (configKey) => {
  try {
    // 1. Try loading from Google Sheets first (cross-device)
    console.log(`🔍 Loading ${configKey} from Google Sheets...`);
    const sheetConfig = await googleSheetsService.loadAdminConfig(configKey);
    
    if (sheetConfig) {
      console.log(`✅ Loaded from Google Sheets: ${configKey} (cross-device)`);
      
      // Update localStorage for faster subsequent loads
      localStorage.setItem(configKey, JSON.stringify(sheetConfig));
      
      return sheetConfig;
    }

    // 2. Fallback to localStorage (same device)
    console.log(`📦 Loading ${configKey} from localStorage...`);
    const localConfig = localStorage.getItem(configKey);
    
    if (localConfig) {
      const parsed = JSON.parse(localConfig);
      console.log(`✅ Loaded from localStorage: ${configKey} (same device only)`);
      return parsed;
    }

    console.log(`ℹ️ No config found for ${configKey}`);
    return null;
  } catch (error) {
    console.error(`❌ Error loading config ${configKey}:`, error);
    
    // Last resort: try localStorage
    try {
      const localConfig = localStorage.getItem(configKey);
      if (localConfig) {
        return JSON.parse(localConfig);
      }
    } catch (localError) {
      console.error('❌ localStorage also failed:', localError);
    }
    
    return null;
  }
};

/**
 * Load config synchronously from localStorage only (for initial render)
 * Then load from Google Sheets in background
 * @param {string} configKey - Config key to load
 * @param {function} setStateCallback - Callback to update state with sheet data
 * @returns {object|null} - Initial config from localStorage
 */
export const loadConfigHybrid = (configKey, setStateCallback) => {
  // 1. Load from localStorage immediately (fast)
  const localConfig = localStorage.getItem(configKey);
  const initialConfig = localConfig ? JSON.parse(localConfig) : null;

  // 2. Load from Google Sheets in background
  googleSheetsService.loadAdminConfig(configKey).then(sheetConfig => {
    if (sheetConfig) {
      console.log(`☁️ Sheet config loaded for ${configKey}, updating state...`);
      
      // Update localStorage
      localStorage.setItem(configKey, JSON.stringify(sheetConfig));
      
      // Update component state
      if (setStateCallback) {
        setStateCallback(sheetConfig);
      }
    }
  }).catch(error => {
    console.warn(`⚠️ Failed to load sheet config for ${configKey}:`, error);
  });

  return initialConfig;
};

/**
 * Clear config from both localStorage and Google Sheets
 * @param {string} configKey - Config key to clear
 * @returns {Promise<boolean>}
 */
export const clearConfig = async (configKey) => {
  try {
    // Clear from localStorage
    localStorage.removeItem(configKey);
    
    // Clear from Google Sheets
    await googleSheetsService.saveAdminConfig(configKey, null);
    
    console.log(`🗑️ Cleared config: ${configKey}`);
    return true;
  } catch (error) {
    console.error(`❌ Error clearing config ${configKey}:`, error);
    return false;
  }
};

/**
 * Sync all admin configs from Google Sheets to localStorage
 * Useful for initializing app on new device
 * @returns {Promise<object>} - Sync results
 */
export const syncAllConfigs = async () => {
  console.log('🔄 Syncing all admin configs from Google Sheets...');
  
  const results = {
    success: [],
    failed: [],
    notFound: []
  };

  for (const configKey of ADMIN_CONFIG_KEYS) {
    try {
      const config = await googleSheetsService.loadAdminConfig(configKey);
      
      if (config) {
        localStorage.setItem(configKey, JSON.stringify(config));
        results.success.push(configKey);
        console.log(`✅ Synced: ${configKey}`);
      } else {
        results.notFound.push(configKey);
        console.log(`ℹ️ Not found: ${configKey}`);
      }
    } catch (error) {
      results.failed.push(configKey);
      console.error(`❌ Failed to sync: ${configKey}`, error);
    }
  }

  console.log('📊 Sync summary:', results);
  return results;
};

/**
 * Export all configs to JSON (for backup)
 * @returns {object} - All configs
 */
export const exportAllConfigs = () => {
  const configs = {};
  
  ADMIN_CONFIG_KEYS.forEach(key => {
    const config = localStorage.getItem(key);
    if (config) {
      configs[key] = JSON.parse(config);
    }
  });
  
  return configs;
};

/**
 * Import configs from JSON (for restore)
 * @param {object} configs - Configs to import
 * @returns {Promise<boolean>}
 */
export const importAllConfigs = async (configs) => {
  try {
    for (const [key, value] of Object.entries(configs)) {
      await saveConfig(key, value);
    }
    return true;
  } catch (error) {
    console.error('❌ Error importing configs:', error);
    return false;
  }
};
