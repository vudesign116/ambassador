# Pre-Deployment Checklist - MerapLion Ambassador

**Date:** _____________  
**Version:** 6.5  
**Deployment Target:** Firebase Hosting  
**Deployed By:** _____________

---

## 📋 **Code Quality**

- [ ] No TypeScript/ESLint errors
- [ ] All warnings reviewed and documented
- [ ] Code formatted consistently
- [ ] No console.log statements in production code (or commented out)
- [ ] No TODO comments for critical features
- [ ] All imports used (no unused imports)
- [ ] Dead code removed

---

## 🔧 **Configuration**

### **Environment Variables**
- [ ] `.env` file exists with correct values
- [ ] `REACT_APP_GOOGLE_SCRIPT_URL` is set
- [ ] `REACT_APP_TRACK_PAGE_VIEW` is configured
- [ ] `REACT_APP_PAGE_VIEW_DELAY` is set (30000ms)
- [ ] No sensitive data in `.env` file

### **Package Configuration**
- [ ] `package.json` version updated
- [ ] All dependencies are up to date
- [ ] `homepage` field configured correctly (if using subdomain)
- [ ] Build scripts working (`npm run build`)

### **Firebase Configuration**
- [ ] `firebase.json` exists
- [ ] `.firebaserc` configured with project ID
- [ ] Single-page app rewrites configured
- [ ] Caching headers set up properly

---

## 🔐 **Security**

- [ ] API tokens not exposed in client code
- [ ] Authentication flow working correctly
- [ ] Phone number validation working
- [ ] Admin panel requires login
- [ ] localStorage data sanitized
- [ ] XSS protection verified
- [ ] CORS properly configured on backend APIs

---

## 🎨 **UI/UX**

### **Pages Verified**
- [ ] Login page works correctly
- [ ] Dashboard displays properly
- [ ] Document list loads
- [ ] Reward selection page functional
- [ ] Introduction page shows correctly
- [ ] Admin panel accessible
- [ ] Error pages display (404, 500)

### **Responsive Design**
- [ ] Mobile layout tested (320px - 480px)
- [ ] Tablet layout tested (481px - 768px)
- [ ] Desktop layout tested (>768px)
- [ ] All images responsive
- [ ] Touch interactions work on mobile

### **Visual Elements**
- [ ] Logo displays correctly
- [ ] Icons load properly
- [ ] Colors match brand guidelines
- [ ] Typography consistent
- [ ] Loading spinners show during async operations
- [ ] Empty states handled gracefully

---

## 🔌 **API Integration**

### **Authentication APIs**
- [ ] `/nvbc_login/` API working
  - Test phone: 0982085810
  - Expected: Returns phone, name, ma_kh_dms
- [ ] `/nvbc_get_point/` API working
  - Expected: Returns show_reward_selection, rewards, points
- [ ] Error handling for failed API calls
- [ ] Network timeout handling

### **Reward APIs**
- [ ] Reward selection submission working
- [ ] POST to `/insert_nvbc_reward_item/` successful
- [ ] Google Sheets sync working (if enabled)

### **Document APIs**
- [ ] Document list loads from API
- [ ] Point tracking on document view
- [ ] History API working

---

## 📊 **Data & State Management**

### **localStorage**
- [ ] phoneNumber saved correctly
- [ ] ma_kh_dms saved correctly
- [ ] userName saved correctly
- [ ] authToken saved correctly
- [ ] rewardStatus saved correctly
- [ ] reward_submitted_{phone} with timestamp
- [ ] Admin config saved correctly

### **State Flow**
- [ ] Login → Dashboard navigation
- [ ] show_reward_selection = true → /reward-selection
- [ ] show_reward_selection = false → /introduction
- [ ] Reward submitted → Show confirmation for 3 days
- [ ] After 3 days → Show "not announced" message

---

## 🧪 **Testing**

### **Functional Testing**
- [ ] User can login with valid phone
- [ ] User cannot login with invalid phone
- [ ] Dashboard loads after login
- [ ] Documents can be viewed
- [ ] Points are tracked
- [ ] Rewards can be selected (if eligible)
- [ ] Admin can configure settings

### **Error Scenarios**
- [ ] 400 error shows "SĐT chưa được đăng ký"
- [ ] 500 error shows "Hệ thống gặp sự cố"
- [ ] 404 error shows "Hệ thống bảo trì"
- [ ] Network error shows "Không thể kết nối"
- [ ] React errors caught by ErrorBoundary

### **Edge Cases**
- [ ] Empty reward list handled
- [ ] No documents available handled
- [ ] Very long names/text overflow handled
- [ ] Large images optimized
- [ ] Slow network tested
- [ ] localStorage quota exceeded handled

---

## 🚀 **Performance**

### **Build Optimization**
- [ ] Build size < 5MB (check with `du -sh build`)
- [ ] No large unoptimized images
- [ ] Code splitting enabled
- [ ] Tree shaking working
- [ ] Minification enabled

### **Runtime Performance**
- [ ] Page load time < 3 seconds
- [ ] No memory leaks in long sessions
- [ ] Smooth scrolling on mobile
- [ ] No janky animations
- [ ] Lazy loading for images/documents

### **Lighthouse Scores** (Target)
- [ ] Performance: >80
- [ ] Accessibility: >90
- [ ] Best Practices: >90
- [ ] SEO: >80

---

## 📱 **Device Testing**

### **Browsers**
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

### **Mobile Devices**
- [ ] iOS Safari (iPhone)
- [ ] Android Chrome
- [ ] Tablet (iPad/Android)

### **Screen Sizes**
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone X)
- [ ] 414px (iPhone Plus)
- [ ] 768px (iPad)
- [ ] 1024px (iPad Pro)
- [ ] 1920px (Desktop)

---

## 📝 **Documentation**

- [ ] README.md updated
- [ ] FIREBASE_DEPLOYMENT.md complete
- [ ] API documentation accurate
- [ ] Environment variables documented
- [ ] Deployment guide clear
- [ ] Troubleshooting section complete

---

## 🔄 **Backup & Rollback**

- [ ] Previous version tagged in Git
- [ ] Database backup taken (if applicable)
- [ ] localStorage migration plan (if schema changed)
- [ ] Rollback procedure documented

---

## 📦 **Dependencies**

- [ ] All `npm install` warnings reviewed
- [ ] No critical security vulnerabilities (`npm audit`)
- [ ] Deprecated packages updated
- [ ] Bundle size acceptable

**Check vulnerabilities:**
```bash
npm audit
npm audit fix
```

---

## 🌐 **Firebase Setup**

### **Firebase Console Verified**
- [ ] Project created in Firebase Console
- [ ] Hosting enabled
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active
- [ ] Analytics configured (optional)

### **Firebase CLI**
- [ ] Firebase CLI installed (`firebase --version`)
- [ ] Logged in to Firebase (`firebase login`)
- [ ] Project initialized (`firebase init`)
- [ ] Test deployment successful

---

## 📈 **Monitoring Setup**

- [ ] Google Analytics ID added (optional)
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] User activity tracking working
- [ ] Google Sheets logging working

---

## ✅ **Final Checks**

### **Pre-Build**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Run build
npm run build

# Check build output
ls -lah build/
du -sh build/
```

### **Pre-Deploy**
```bash
# Test locally
npx serve -s build -l 3000

# Open http://localhost:3000 and test
```

### **Deploy**
```bash
# Deploy to Firebase
firebase deploy --only hosting

# Or use deploy script
./deploy.sh
```

---

## 🎯 **Post-Deployment Verification**

After deployment, verify:

- [ ] Site loads at Firebase URL
- [ ] Login works
- [ ] Dashboard displays
- [ ] Documents load
- [ ] APIs respond correctly
- [ ] No console errors
- [ ] Mobile version works
- [ ] Custom domain works (if configured)

**Test URLs:**
- Firebase: https://your-project-id.web.app
- Custom (if configured): https://ambassador.meraplion.com

---

## 📞 **Support Contacts**

**Technical Issues:**
- Developer: _____________
- Email: _____________

**Firebase Issues:**
- Firebase Support: https://firebase.google.com/support
- Status: https://status.firebase.google.com

---

## 🔖 **Deployment Sign-off**

**All checks completed:** [ ]

**Approved by:** _____________  
**Date:** _____________  
**Time:** _____________  

**Deployment Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

**Firebase Project ID:** _____________  
**Deployment URL:** _____________  
**Version Deployed:** _____________  

---

**Status:** Ready for Production ✅
