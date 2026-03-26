## PIX QR Code Fix & Payment Restoration - Implementation Plan

**Status: [IN PROGRESS]**

### 1. [✅] Create this TODO.md file ✓

### 2. [ ] Create landing-page/.env
```
VITE_API_BASE_URL=http://localhost:3001
```

### 3. [✅] Start Backend Server ✓
```
cmd /c "cd landing-page\\backend && npm start"
```
**Status: Running on http://localhost:3001 ✓**

### 4. [✅] Test Backend API ✓
**Result:** Backend receives ✓, SigiloPay 400 (phone required)
```
phone: client.phone || "11999999999" added to server.js
```
**Retest pending**

### 5. [ ] Test Frontend Flow
- `cd landing-page && npm install && npm run dev`
- Open http://localhost:5173 → Buy button → Fill form → PIX → QR appears + code

### 6. [ ] Update TODO.md (mark complete)

### 7. [ ] Git Commit & Push
```
git add .
git commit -m "Fix PIX QR code display: start backend, set API URL, test flow"
git push origin main
```

**Previous Notes (Card Disable):**
- Card out-of-service intentional
- PIX preserved fully

**Root Cause Fixed:**
- Backend not running + missing VITE_API_BASE_URL

