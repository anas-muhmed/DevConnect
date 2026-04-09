# 🔐 JWT Refresh Token Architecture Guide

## 📚 Understanding the System

### What Problem Are We Solving?

**The Security Dilemma:**
- **Short-lived tokens** = Secure (if stolen, expires quickly)
- **Long-lived tokens** = Convenient (don't need to login often)
- **Our Solution**: Use BOTH! 

---

## 🏗️ Two-Token Architecture

### 1️⃣ Access Token (Short-lived: 15 minutes)
- **Stored in**: `localStorage` or `sessionStorage`
- **Sent via**: `Authorization: Bearer <token>` header
- **Contains**: User ID, username
- **Used for**: Every API request
- **Risk**: If stolen, attacker has 15 min access
- **Why short?**: Minimize damage if token is compromised

### 2️⃣ Refresh Token (Long-lived: 7 days)
- **Stored in**: `httpOnly cookie` (JavaScript can't access it!)
- **Sent via**: Browser automatically sends with requests
- **Contains**: Only user ID
- **Used for**: Getting new access tokens
- **Risk**: Very secure! XSS attacks can't steal it
- **Why long?**: So user doesn't need to login every 15 min

---

## 🔄 The Complete Flow

### Initial Login
```
┌─────────┐                  ┌─────────────┐
│ Browser │                  │   Backend   │
└────┬────┘                  └──────┬──────┘
     │                              │
     │ POST /auth/login             │
     │ { email, password }          │
     ├─────────────────────────────>│
     │                              │
     │                         ✅ Validate credentials
     │                         🔑 Generate Access Token (15m)
     │                         🍪 Generate Refresh Token (7d)
     │                              │
     │      200 OK                  │
     │   { token, user }            │
     │   Set-Cookie: refreshToken   │
     │<─────────────────────────────┤
     │                              │
     ✅ Store access token          │
     ✅ Cookie stored automatically │
```

### Making Protected Requests
```
┌─────────┐                  ┌─────────────┐
│ Browser │                  │   Backend   │
└────┬────┘                  └──────┬──────┘
     │                              │
     │ GET /api/posts               │
     │ Authorization: Bearer <token>│
     │ Cookie: refreshToken=...     │
     ├─────────────────────────────>│
     │                              │
     │                         ✅ Verify access token
     │                         ✅ Token valid!
     │                              │
     │      200 OK                  │
     │   { posts: [...] }           │
     │<─────────────────────────────┤
```

### When Access Token Expires (Magic Happens Here!)
```
┌─────────┐                  ┌─────────────┐
│ Browser │                  │   Backend   │
└────┬────┘                  └──────┬──────┘
     │                              │
     │ 1️⃣ GET /api/posts            │
     │ Authorization: Bearer <EXPIRED>
     ├─────────────────────────────>│
     │                              │
     │                         ❌ Token expired!
     │                              │
     │      401 Unauthorized        │
     │<─────────────────────────────┤
     │                              │
     🤖 INTERCEPTOR ACTIVATES!       │
     │                              │
     │ 2️⃣ GET /auth/refresh         │
     │ Cookie: refreshToken=...     │
     ├─────────────────────────────>│
     │                              │
     │                         ✅ Verify refresh token from cookie
     │                         🔑 Generate NEW access token (15m)
     │                              │
     │      200 OK                  │
     │   { token: <NEW> }           │
     │<─────────────────────────────┤
     │                              │
     ✅ Update stored token          │
     │                              │
     │ 3️⃣ RETRY: GET /api/posts     │
     │ Authorization: Bearer <NEW>  │
     ├─────────────────────────────>│
     │                              │
     │                         ✅ Success!
     │                              │
     │      200 OK                  │
     │   { posts: [...] }           │
     │<─────────────────────────────┤
     │                              │
```

**User Experience**: Seamless! They never even know the token refreshed! 🎉

---

## 🛡️ Security Features

### 1. HttpOnly Cookies
```javascript
res.cookie('refreshToken', token, {
  httpOnly: true,  // ← JavaScript CAN'T access this!
  secure: true,    // ← HTTPS only (in production)
  sameSite: 'Lax', // ← CSRF protection
})
```

**Why httpOnly?**
- XSS Attack: `document.cookie` → ❌ Can't access it!
- Malicious script can't steal refresh token
- Even if attacker injects JS, refresh token is safe

### 2. Token Separation
- **Access Token**: Stored in JS-accessible storage (needed for headers)
- **Refresh Token**: Stored in httpOnly cookie (maximum security)
- **Result**: If XSS attack steals access token, it only works for 15 minutes!

### 3. Automatic Token Rotation
- Every refresh gives a NEW access token
- Old tokens become invalid
- Limits the window of vulnerability

---

## 💻 Frontend Implementation Details

### Axios Interceptor Pattern
```javascript
let isRefreshing = false;      // ← Prevents multiple refresh calls
let failedQueue = [];          // ← Holds requests waiting for new token

axiosInstance.interceptors.response.use(
  response => response,        // ← Success: do nothing
  async error => {             // ← Error: check if 401
    
    if (error.response?.status === 401) {
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }
      
      isRefreshing = true;
      
      try {
        // Get new token
        const { data } = await refreshAxios.get('/auth/refresh');
        
        // Update storage
        localStorage.setItem('token', data.token);
        
        // Retry ALL queued requests with new token
        processQueue(null, data.token);
        
        // Retry THIS request
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed = logout
        performLogout();
      } finally {
        isRefreshing = false;
      }
    }
  }
);
```

**Why the queue?**
Imagine you have 5 API calls happening simultaneously:
1. All 5 fail with 401 at the same time
2. Without queue: Each would try to refresh → 5 refresh calls!
3. With queue: 
   - First one refreshes
   - Other 4 wait in queue
   - When done, all 5 retry with new token
   - Result: Only 1 refresh call! ✅

---

## 🎯 Best Practices We Implemented

### ✅ Appropriate Token Lifetimes
```javascript
accessToken:  "15m"  // Short enough to be secure
refreshToken: "7d"   // Long enough to be convenient
```

**Why 15 minutes?**
- Short enough: Stolen token expires quickly
- Long enough: Not annoying (auto-refresh is invisible)
- Industry standard: Most apps use 15m-1h

### ✅ Separate Axios Instances
```javascript
const axiosInstance = axios.create({ ... });  // For normal API calls
const refreshAxios = axios.create({ ... });   // For refresh endpoint
```

**Why separate?**
- Prevents interceptor loops!
- If refresh call gets 401, it doesn't trigger interceptor again
- Cleaner error handling

### ✅ Error Code System
```javascript
{
  code: "NO_REFRESH_TOKEN",      // User needs to login
  code: "INVALID_REFRESH_TOKEN", // Token expired, login required
  code: "USER_NOT_FOUND"         // Account deleted
}
```

**Why codes?**
- Frontend can show specific messages
- Better debugging
- Can handle different errors differently

### ✅ Cookie Security
```javascript
{
  httpOnly: true,     // JS can't access (XSS protection)
  secure: production, // HTTPS only in production
  sameSite: 'Lax',   // CSRF protection
  path: '/',         // Available site-wide
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "No refresh token provided"
**Cause**: Browser not sending cookie
**Solutions**:
1. ✅ `withCredentials: true` on axios
2. ✅ CORS `credentials: true` on backend
3. ✅ Check cookie domain matches request domain
4. ✅ Use `127.0.0.1` consistently (not mixing with `localhost`)

### Issue 2: Infinite redirect loops
**Cause**: Logout redirects to login, which has 401, which logs out...
**Solution**: Check path before redirecting
```javascript
if (!window.location.pathname.includes('/login')) {
  window.location.href = '/login';
}
```

### Issue 3: Multiple refresh calls
**Cause**: Multiple requests fail simultaneously
**Solution**: Use `isRefreshing` flag + request queue ✅ (We implemented this!)

---

## 📊 Flow Diagram: Complete Picture

```
USER OPENS APP
     │
     ├─> Has valid access token? ──YES──> Use it for requests
     │                                            │
     NO                                           │
     │                                            │
     └─> Try to refresh using cookie              │
         (Happens automatically via interceptor)  │
              │                                    │
              ├─> Refresh successful ──YES──> Get new access token
              │                                    │
              NO                                   │
              │                                    │
              └─> Redirect to login ────────────────┘
```

---

## 🧪 Testing Your Implementation

### Test 1: Fresh Login
1. Open DevTools → Application → Cookies
2. Clear all cookies
3. Login
4. ✅ Should see `refreshToken` cookie
5. ✅ Should see access token in localStorage/sessionStorage

### Test 2: Token Refresh
1. Login
2. Wait 16 minutes (or manually change token expiry to 10s for testing)
3. Make any API call (create post, get profile, etc.)
4. ✅ Should work seamlessly
5. ✅ Check console: Should see "Token refreshed successfully"

### Test 3: Invalid Refresh Token
1. Login
2. DevTools → Application → Cookies
3. Edit `refreshToken` cookie value (add random characters)
4. Make any API call
5. ✅ Should redirect to login
6. ✅ Should show "Session expired" message

### Test 4: Multiple Simultaneous Requests
1. Login
2. Change access token expiry to 10s
3. Wait 11 seconds
4. Click multiple buttons quickly (create post, get profile, etc.)
5. ✅ Should only see ONE refresh call in Network tab
6. ✅ All requests should succeed

---

## 🚀 Production Checklist

When deploying to production:

### Backend (.env)
```bash
NODE_ENV=production
JWT_SECRET=<strong-random-secret>           # Change this!
JWT_REFRESH_SECRET=<different-strong-secret># Change this!
```

### Frontend (vite config)
```javascript
// Update CORS origin to your production domain
app.use(cors({
  origin: 'https://yourapp.com',
  credentials: true
}));
```

### Cookie Settings (Auto-handled!)
```javascript
secure: process.env.NODE_ENV === 'production' // ✅ Already implemented!
```

---

## 🎓 Key Takeaways

1. **Two tokens = Best of both worlds** (security + convenience)
2. **HttpOnly cookies = Maximum security** for refresh tokens
3. **Axios interceptors = Invisible UX** (auto-refresh)
4. **Request queuing = Efficient** (one refresh, not many)
5. **Error codes = Better debugging** and user messages

---

## 📖 Further Learning

- **JWT.io**: Decode and inspect your tokens
- **OWASP**: Token storage best practices
- **RFC 6749**: OAuth 2.0 (where refresh tokens come from)

---

**Built with ❤️ for DevConnect**
*Now you understand production-grade authentication!* 🎉
