# 🔐 Auth System Overview – DevConnect

This file documents how authentication works in the DevConnect backend using **access tokens**, **refresh tokens**, and **httpOnly cookies**.

---

## 🌐 Token Strategy

### ✅ Access Token
- Short-lived (1 hour)
- Sent in `Authorization` header (Bearer token)
- Stored in `localStorage` or `sessionStorage` on the frontend

### 🔁 Refresh Token
- Long-lived (7 days)
- Stored securely in an `httpOnly` cookie (not accessible via JavaScript)
- Sent automatically by the browser during `/auth/refresh` requests

---

## 🔐 Cookie Configuration

The refresh token cookie is set during login:
```js
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: false,            // ✅ Set to true in production
  sameSite: 'Lax',          // 🛡 Prevents CSRF while allowing basic use
  path: '/api/auth/refresh',// 🔒 Restricts when the cookie is sent
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});



              //=============================visual diagram===================================================
                                  [Login Request]
  |
  └── POST /auth/login
       → accessToken (JSON)
       → refreshToken (httpOnly cookie)

[Frontend Requests API]
  |
  └── accessToken in header:
      Authorization: Bearer <accessToken>

[Access Token Expired]
  |
  └── Axios auto-calls:
      POST /auth/refresh
      → new accessToken in JSON

[Logout]
  |
  └── POST /auth/logout
      → refreshToken cookie cleared
