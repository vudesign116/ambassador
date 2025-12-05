/**
 * Firebase Cloud Functions - API Proxy
 * 
 * Purpose: Bypass CORS restrictions by proxying requests to bi.meraplion.com
 * Benefits:
 * - No CORS issues (same-origin with React app)
 * - Hide Bearer token from client (security)
 * - Works on all networks (wifi, 4G, company network)
 */

const functions = require('firebase-functions');
const fetch = require('node-fetch');

// Bearer token (hidden from client)
const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzY3MzE4MDAwLCJlbWFpbCI6IiJ9.JgA5ZhB-7tQ5hbxlKLq8S_hVT0tD_E5r7EWmCpx_jNk';
const API_BASE_URL = 'https://bi.meraplion.com/local';

/**
 * Login API Proxy
 * 
 * Endpoint: POST /api/login
 * Body: { "phone": "0982688284" }
 * Response: { "success": true, "data": {...} } or { "success": false, "error": "..." }
 */
exports.login = functions.https.onRequest(async (req, res) => {
  // Enable CORS for all origins (or restrict to your domain)
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }
  
  try {
    const { phone } = req.body;
    
    if (!phone) {
      res.status(400).json({ success: false, error: 'Phone number required' });
      return;
    }
    
    // Call backend API
    console.log('📞 Calling /nvbc_login/ for phone:', phone);
    
    const loginResponse = await fetch(`${API_BASE_URL}/nvbc_login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({ phone })
    });
    
    const loginData = await loginResponse.json();
    
    // Check if login failed
    if (!loginResponse.ok || loginData.mess_error) {
      console.log('❌ Login failed:', loginData.mess_error || 'Unknown error');
      res.status(400).json({ 
        success: false, 
        error: loginData.mess_error || 'Phone not found',
        statusCode: loginResponse.status
      });
      return;
    }
    
    // Get reward status
    console.log('🎁 Calling /nvbc_get_point/ for phone:', phone);
    
    const rewardResponse = await fetch(`${API_BASE_URL}/nvbc_get_point/?phone=${phone}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    const rewardData = await rewardResponse.json();
    
    // Combine data
    const responseData = {
      success: true,
      data: {
        phone: loginData.phone,
        ma_kh_dms: loginData.ma_kh_dms,
        name: loginData.name,
        rewardStatus: {
          show_reward_selection: rewardData.show_reward_selection || false,
          th_monthly_reward: rewardData.th_monthly_reward || false,
          product_expert_reward: rewardData.product_expert_reward || false,
          avid_reader_reward: rewardData.avid_reader_reward || false,
          point: rewardData.point || 0
        }
      }
    };
    
    console.log('✅ Login successful for:', loginData.phone);
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * Get Reward Points Proxy
 * 
 * Endpoint: GET /api/getPoints?phone=0982688284
 */
exports.getPoints = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }
  
  try {
    const { phone } = req.query;
    
    if (!phone) {
      res.status(400).json({ success: false, error: 'Phone number required' });
      return;
    }
    
    console.log('🎁 Getting points for:', phone);
    
    const response = await fetch(`${API_BASE_URL}/nvbc_get_point/?phone=${phone}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      res.status(response.status).json({ success: false, error: 'Failed to get points' });
      return;
    }
    
    res.status(200).json({ success: true, data });
    
  } catch (error) {
    console.error('❌ Error getting points:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
    });
  }
});
