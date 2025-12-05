/**
 * Mock Data Helper for Testing Reward Selection
 * 
 * Sử dụng trong console để test các trường hợp khác nhau
 */

// Scenario 1: Có 1 giải thưởng (Thành viên tích cực)
export const mockReward1 = {
  show_reward_selection: true,
  th_monthly_reward: true,
  product_expert_reward: false,
  avid_reader_reward: false,
  point: 1500,
  lich_su_diem: [],
  contentlist: []
};

// Scenario 2: Có 2 giải thưởng
export const mockReward2 = {
  show_reward_selection: true,
  th_monthly_reward: true,
  product_expert_reward: true,
  avid_reader_reward: false,
  point: 3200,
  lich_su_diem: [],
  contentlist: []
};

// Scenario 3: Có 3 giải thưởng (Full rewards)
export const mockReward3 = {
  show_reward_selection: true,
  th_monthly_reward: true,
  product_expert_reward: true,
  avid_reader_reward: true,
  point: 5500,
  lich_su_diem: [],
  contentlist: []
};

// Scenario 4: Không có giải nào
export const mockRewardNone = {
  show_reward_selection: false,
  th_monthly_reward: false,
  product_expert_reward: false,
  avid_reader_reward: false,
  point: 500,
  lich_su_diem: [],
  contentlist: []
};

// Mock introduction config với gifts
export const mockIntroConfig = {
  logo: '',
  introText: 'Test intro text',
  awards: [
    {
      title: '🎁 Thành viên tích cực nhất tháng',
      description: 'Top 100 thành viên có mức điểm tích lũy cao nhất trong tháng',
      gifts: [
        {
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmNjg4ZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZHk9Ii4zZW0iPvCfjrs8L3RleHQ+PC9zdmc+',
          name: 'Bộ quà tặng Premium A'
        },
        {
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY2N2VlYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZHk9Ii4zZW0iPvCfjrs8L3RleHQ+PC9zdmc+',
          name: 'Bộ quà tặng Premium B'
        },
        {
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzUyYzQxYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZHk9Ii4zZW0iPvCfjrs8L3RleHQ+PC9zdmc+',
          name: 'Bộ quà tặng Premium C'
        }
      ]
    },
    {
      title: '🏆 Chuyên gia sản phẩm',
      description: 'Top 50 thành viên có kiến thức sâu về sản phẩm',
      gifts: [
        {
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmYzUzZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZHk9Ii4zZW0iPvCfj4Y8L3RleHQ+PC9zdmc+',
          name: 'Voucher mua sắm 500K'
        },
        {
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmNzg3NSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZHk9Ii4zZW0iPvCfj4Y8L3RleHQ+PC9zdmc+',
          name: 'Thẻ quà tặng 300K'
        }
      ]
    },
    {
      title: '📚 Đọc giả chăm chỉ',
      description: 'Top 30 thành viên có số ngày tham gia nhiều nhất',
      gifts: [
        {
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzM5OGRmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZHk9Ii4zZW0iPvCfk5o8L3RleHQ+PC9zdmc+',
          name: 'Sách chuyên ngành'
        },
        {
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzk0NzRiOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZHk9Ii4zZW0iPvCfk5o8L3RleHQ+PC9zdmc+',
          name: 'Khóa học online'
        }
      ]
    }
  ]
};

/**
 * Function to setup mock data for testing
 * Run in browser console:
 * 
 * // Test 1 reward
 * setupMockReward(1);
 * 
 * // Test 2 rewards
 * setupMockReward(2);
 * 
 * // Test 3 rewards (full)
 * setupMockReward(3);
 * 
 * // Test no rewards
 * setupMockReward(0);
 */
window.setupMockReward = function(scenario) {
  // Setup auth first
  if (!localStorage.getItem('phoneNumber')) {
    localStorage.setItem('phoneNumber', '0989548952');
  }
  if (!localStorage.getItem('authToken')) {
    localStorage.setItem('authToken', 'mock_token_for_testing');
  }
  
  // Setup introduction config with gifts
  localStorage.setItem('admin_introduction_config', JSON.stringify(mockIntroConfig));
  
  // Setup reward data based on scenario
  let rewardData;
  switch(scenario) {
    case 0:
      rewardData = mockRewardNone;
      console.log('✅ Mock setup: NO REWARDS');
      break;
    case 1:
      rewardData = mockReward1;
      console.log('✅ Mock setup: 1 REWARD (Thành viên tích cực)');
      break;
    case 2:
      rewardData = mockReward2;
      console.log('✅ Mock setup: 2 REWARDS (Tích cực + Chuyên gia)');
      break;
    case 3:
      rewardData = mockReward3;
      console.log('✅ Mock setup: 3 REWARDS (FULL)');
      break;
    default:
      rewardData = mockReward3;
      console.log('✅ Mock setup: 3 REWARDS (FULL) - Default');
  }
  
  // Store mock data that RewardSelectionPage will check
  window.__MOCK_REWARD_DATA__ = rewardData;
  
  console.log('Mock data:', rewardData);
  console.log('📝 Now navigate to /ambassador/reward-selection or click Test Reward button');
  console.log('🔄 Refresh page after navigation to see the mock data');
};

// Auto-setup for quick testing (3 rewards by default)
console.log('🎁 Mock Reward Data Helper Loaded!');
console.log('📝 Run in console:');
console.log('   setupMockReward(0)  - No rewards');
console.log('   setupMockReward(1)  - 1 reward');
console.log('   setupMockReward(2)  - 2 rewards');
console.log('   setupMockReward(3)  - 3 rewards (full)');
console.log('');
console.log('✨ Quick start: setupMockReward(3)');
