# 🔄 Update All Admin Pages to Use ConfigSync

## Pages cần update:

1. ✅ AdminLoginPageConfig.js - DONE
2. ⏳ AdminDashboardConfig.js - Badges
3. ⏳ AdminIntroductionConfig.js - Introduction & Gifts
4. ⏳ AdminScoringRulesConfig.js - Scoring Rules
5. ⏳ AdminNotificationConfig.js - Notifications
6. ⏳ AdminMiniGames.js - Mini Games
7. ⏳ SurveyFormPage.js - Survey Config

## Pattern to apply:

### Import changes:
```javascript
// OLD
import { googleSheetsService } from '../services/googleSheetsService';

// NEW
import { saveConfig, loadConfig } from '../utils/configSync';
```

### Load config:
```javascript
// OLD
const savedConfig = localStorage.getItem('admin_xxx_config');
if (savedConfig) {
  const parsed = JSON.parse(savedConfig);
  setConfig(parsed);
}

// NEW
const savedConfig = await loadConfig('admin_xxx_config');
if (savedConfig) {
  setConfig(savedConfig);
}
```

### Save config:
```javascript
// OLD
localStorage.setItem('admin_xxx_config', JSON.stringify(config));

// NEW
await saveConfig('admin_xxx_config', config);
```

## User Pages to update:

1. ✅ LoginPage.js - DONE
2. ⏳ IntroductionPage.js
3. ⏳ ScoringRulesPage.js
4. ⏳ DashboardPage.js (for badges)
5. ⏳ NotificationPopup.js
6. ⏳ RewardSelectionPage.js

## Pattern for User Pages:

```javascript
// Import
import { loadConfig } from '../utils/configSync';

// In useEffect
const config = await loadConfig('admin_xxx_config');
if (config) {
  // Use config
}
```
