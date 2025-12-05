# 🔍 CHECK ADMIN CONFIG - REWARD KEY MAPPING

## 📋 Quick Check

Mở **Browser Console** và chạy commands sau:

### 1️⃣ **Check Admin Config:**

```javascript
const config = JSON.parse(localStorage.getItem('admin_introduction_config'));
console.log('Admin Config:', config);
console.log('Awards:', config?.awards);
```

### 2️⃣ **Check Reward Keys:**

```javascript
const config = JSON.parse(localStorage.getItem('admin_introduction_config'));
config?.awards?.forEach((award, idx) => {
  console.log(`Award ${idx + 1}:`, {
    title: award.title,
    reward_key: award.reward_key || '❌ MISSING',
    icon: award.icon || '❌ MISSING',
    giftsCount: award.gifts?.length || 0
  });
});
```

### 3️⃣ **Expected Output:**

```javascript
Award 1: {
  title: "Giải tích cực tháng",
  reward_key: "th_monthly_reward",      // ✅ Must match API key
  icon: "🏆",
  giftsCount: 2
}

Award 2: {
  title: "Giải DGCC/CGSP", 
  reward_key: "product_expert_reward",  // ✅ Must match API key
  icon: "🎯",
  giftsCount: 2
}

Award 3: {
  title: "Tích cực và tốt nhất tháng",
  reward_key: "best_active_member",     // ✅ Must match API key
  icon: "🌟",
  giftsCount: 2
}
```

---

## ❌ Nếu thấy `reward_key: "❌ MISSING"`:

Cần config lại trong **Admin → Introduction Config**:

1. Mở: http://localhost:3000/ambassador/admin/introduction-config
2. Edit từng Award
3. Thêm field **Reward Key** (lowercase_underscore)
4. Thêm field **Icon** (emoji)
5. Save

---

## ✅ Mapping Table:

| Admin `reward_key` | API Response Key | Description |
|-------------------|------------------|-------------|
| `th_monthly_reward` | `th_monthly_reward` | Giải tích cực tháng |
| `product_expert_reward` | `product_expert_reward` | Giải DGCC/CGSP |
| `avid_reader_reward` | `avid_reader_reward` | Độc giả tích cực |
| `best_active_member` | `best_active_member` | Tích cực và tốt nhất tháng |

**⚠️ IMPORTANT:** `reward_key` phải **GIỐNG CHÍNH XÁC** với key trong API response!

---

## 🔄 Current Behavior:

### **If `reward_key` EXISTS in admin config:**
```javascript
awards.forEach(award => {
  if (award.reward_key) {
    giftsMap[award.reward_key] = award.gifts;  // ✅ DYNAMIC MAPPING
  }
});
```

### **If `reward_key` MISSING (fallback):**
```javascript
// ⚠️ Uses old keyword matching (not reliable)
if (title.includes('tích cực')) {
  giftsMap.th_monthly_reward = award.gifts;
}
```

---

## 🎯 To Fix:

1. **Check admin config** có `reward_key` chưa
2. **Nếu chưa** → Add `reward_key` cho tất cả awards
3. **Refresh page** → Dynamic mapping sẽ hoạt động
4. **Check console** → Should see correct mapping

---

## 🧪 Test Commands:

```javascript
// Check current mapping
console.log(window.rewardMetadata);

// Should see:
{
  th_monthly_reward: { title: "...", icon: "🏆" },
  product_expert_reward: { title: "...", icon: "🎯" },
  best_active_member: { title: "...", icon: "🌟" }  // New one!
}
```

---

**Next Step:** Run these checks in browser console! 🚀
