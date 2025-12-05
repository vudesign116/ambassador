/**
 * API Service - Xử lý sync điểm về server
 */

import * as PointsManager from './pointsManager';

/**
 * Sync điểm về API (sẽ được implement sau khi có API endpoint)
 * @returns {Promise<boolean>} true nếu sync thành công
 */
export const syncPointsToAPI = async () => {
  try {
    const authToken = localStorage.getItem('authToken');
    const syncData = PointsManager.getDataForSync();
    
    if (!authToken || syncData.earned_points.length === 0) {
      console.log('No points to sync or not authenticated');
      return false;
    }

    // TODO: Replace with actual API endpoint
    const API_ENDPOINT = 'https://bi.meraplion.com/local/nvbc_save_points/';
    
    console.log('Syncing points to API:', syncData);
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(syncData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Points synced successfully:', result);
      
      // Clear session points after successful sync
      PointsManager.clearSessionPoints();
      
      return true;
    } else {
      console.error('Failed to sync points:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error syncing points to API:', error);
    return false;
  }
};

/**
 * Auto-sync điểm khi user có activity
 * Call function này sau khi user xem document
 */
export const autoSyncPoints = () => {
  // Debounce để tránh gọi API quá nhiều
  if (window.syncTimeout) {
    clearTimeout(window.syncTimeout);
  }
  
  window.syncTimeout = setTimeout(() => {
    syncPointsToAPI();
  }, 5000); // Sync sau 5 giây không có activity
};

/**
 * Sync điểm khi user logout hoặc close app
 */
export const syncOnExit = () => {
  // Use sendBeacon for guaranteed delivery even if page is closing
  const authToken = localStorage.getItem('authToken');
  const syncData = PointsManager.getDataForSync();
  
  if (!authToken || syncData.earned_points.length === 0) {
    return;
  }

  const API_ENDPOINT = 'https://bi.meraplion.com/local/nvbc_save_points/';
  
  try {
    const blob = new Blob([JSON.stringify(syncData)], { type: 'application/json' });
    navigator.sendBeacon(API_ENDPOINT, blob);
    console.log('Points synced on exit');
  } catch (error) {
    console.error('Error syncing points on exit:', error);
  }
};

/**
 * Setup auto-sync listeners
 */
export const setupAutoSync = () => {
  // Sync before page unload
  window.addEventListener('beforeunload', () => {
    syncOnExit();
  });
  
  // Sync when app goes to background (mobile)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      syncPointsToAPI();
    }
  });
  
  console.log('Auto-sync listeners setup complete');
};
