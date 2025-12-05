# Reward Submission Tracking Logic

## Overview
Since the API doesn't provide a submission status flag, we use **localStorage with timestamp** to track when users submit their reward selection and control the display for 3 days.

## Flow Diagram

```
User Login
    ↓
Check show_reward_selection from API
    ↓
┌───────────────────────────────────────┐
│ Check localStorage submission data    │
└───────────────────────────────────────┘
    ↓
    ├─ No submission data
    │   ↓
    │   ├─ show_reward_selection = true
    │   │   → Show reward selection page (can select gifts)
    │   │
    │   └─ show_reward_selection = false
    │       → Show "Chưa được công bố" message
    │
    └─ Has submission data
        ↓
        ├─ Within 3 days
        │   → Show "Bạn đã chọn quà tặng rồi!" (confirmation message)
        │
        └─ More than 3 days
            → Clear submission data
            → Show normal flow based on show_reward_selection
```

## Implementation Details

### 1. Submission Storage
When user successfully submits reward selection:

```javascript
const submissionData = {
  submitted: true,
  timestamp: Date.now(), // Current time in milliseconds
  submittedAt: new Date().toISOString() // Human readable
};
localStorage.setItem(`reward_submitted_${phoneNumber}`, JSON.stringify(submissionData));
```

**Key:** `reward_submitted_{phoneNumber}`
**Value:** JSON object with:
- `submitted`: boolean flag
- `timestamp`: Unix timestamp (for calculation)
- `submittedAt`: ISO string (for display)

### 2. Checking Submission Status
On page load:

```javascript
const submittedData = localStorage.getItem(`reward_submitted_${phoneNumber}`);
if (submittedData) {
  const parsed = JSON.parse(submittedData);
  const submittedTimestamp = parsed.timestamp;
  const now = Date.now();
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // 3 days
  
  if ((now - submittedTimestamp) < threeDaysInMs) {
    // Show "Already selected" message
    setRewardData({ 
      show_reward_selection: false, 
      submitted_recently: true,
      submitted_at: parsed.submittedAt 
    });
  } else {
    // Clear expired flag
    localStorage.removeItem(`reward_submitted_${phoneNumber}`);
  }
}
```

### 3. Display Logic

**Case 1: No submission (Normal flow)**
- `show_reward_selection = true` → Show reward selection page
- `show_reward_selection = false` → Show "Chưa được công bố"

**Case 2: Submitted within 3 days**
- `submitted_recently = true` → Show "Bạn đã chọn quà tặng rồi!"
- Icon: ✅ CheckCircleOutlined (green)
- Message: "Cảm ơn bạn đã tham gia. Chúng tôi sẽ liên hệ để giao quà sớm nhất."
- Show submission timestamp

**Case 3: Submitted more than 3 days ago**
- Automatically clear submission flag
- Return to normal flow (show "Chưa được công bố")

## UI States

### State 1: Not Announced (show_reward_selection = false)
```
┌─────────────────────────────────────┐
│  🏆 Trophy Icon (Yellow)            │
│  Danh sách quà lần này dành cho X   │
│  Chưa được công bố...               │
└─────────────────────────────────────┘
```

### State 2: Already Selected (submitted_recently = true)
```
┌─────────────────────────────────────┐
│  ✅ Check Icon (Green)              │
│  Bạn đã chọn quà tặng rồi!          │
│  Cảm ơn bạn đã tham gia...          │
│  Đã chọn lúc: [timestamp]           │
└─────────────────────────────────────┘
```

### State 3: Can Select (show_reward_selection = true)
```
┌─────────────────────────────────────┐
│  Reward Category 1                  │
│  [Gift 1] [Gift 2] [Gift 3]         │
├─────────────────────────────────────┤
│  Reward Category 2                  │
│  [Gift 1] [Gift 2] [Gift 3]         │
├─────────────────────────────────────┤
│  [Submit Button]                    │
└─────────────────────────────────────┘
```

## Timeline Example

```
Day 0: User submits reward selection
├─ localStorage set with timestamp
└─ Show "Bạn đã chọn quà tặng rồi!"

Day 1-3: User revisits page
├─ Check timestamp: within 3 days
└─ Show "Bạn đã chọn quà tặng rồi!"

Day 4+: User revisits page
├─ Check timestamp: expired (>3 days)
├─ Clear localStorage flag
└─ Show "Chưa được công bố" message
```

## Configuration

**Display Period:** 3 days (configurable)
```javascript
const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
```

To change display period:
- 2 days: `2 * 24 * 60 * 60 * 1000`
- 4 days: `4 * 24 * 60 * 60 * 1000`
- 1 week: `7 * 24 * 60 * 60 * 1000`

## Backward Compatibility

Old format (just boolean `'true'`):
```javascript
localStorage.setItem(`reward_submitted_${phoneNumber}`, 'true');
```

New code handles this gracefully:
```javascript
try {
  const parsed = JSON.parse(submittedData);
  // Process new format
} catch (e) {
  // Old format detected - treat as expired and clear
  localStorage.removeItem(`reward_submitted_${phoneNumber}`);
}
```

## Edge Cases Handled

1. **Clock changes**: Uses `Date.now()` which is not affected by timezone changes
2. **Old submissions**: Clears legacy `'true'` format automatically
3. **Multiple phones**: Each phone has separate tracking (`reward_submitted_{phone}`)
4. **Logout/Login**: Data persists across sessions (localStorage)
5. **Browser clear data**: User can select again (API is source of truth anyway)

## Testing Scenarios

### Test 1: Fresh Submission
1. Login with `show_reward_selection = true`
2. Select rewards and submit
3. ✅ Should show "Bạn đã chọn quà tặng rồi!"
4. Navigate away and return
5. ✅ Should still show "Đã chọn quà" message

### Test 2: Within 3 Days
1. Set fake submission 2 days ago:
```javascript
const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
localStorage.setItem('reward_submitted_0982085810', JSON.stringify({
  submitted: true,
  timestamp: twoDaysAgo,
  submittedAt: new Date(twoDaysAgo).toISOString()
}));
```
2. Reload page
3. ✅ Should show "Đã chọn quà" message

### Test 3: After 3 Days
1. Set fake submission 4 days ago:
```javascript
const fourDaysAgo = Date.now() - (4 * 24 * 60 * 60 * 1000);
localStorage.setItem('reward_submitted_0982085810', JSON.stringify({
  submitted: true,
  timestamp: fourDaysAgo,
  submittedAt: new Date(fourDaysAgo).toISOString()
}));
```
2. Reload page
3. ✅ Should clear flag and show "Chưa được công bố"

## Code Locations

**File:** `src/pages/RewardSelectionPage.js`

**Sections:**
1. Lines 43-61: Check submission with timestamp
2. Lines 319-327: Save submission with timestamp
3. Lines 456-515: Render different UI based on submission status

## Future Enhancements

If API adds submission status:
```javascript
// Instead of localStorage, use API response:
const response = await fetch('/nvbc_get_point/?phone=xxx');
const data = await response.json();

if (data.has_submitted_reward) {
  // Show "Already selected" message
  // Can also get server timestamp for more accuracy
}
```

This would eliminate need for localStorage tracking entirely.

---

**Last Updated:** 2025-10-16
**Version:** 6.5
