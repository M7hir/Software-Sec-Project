# Frontend Security Implementation Guide

## Overview

This document outlines the security measures implemented in the frontend to protect against CSRF, XSS, and other attacks.

## ✅ Security Features Implemented

### 1. CSRF (Cross-Site Request Forgery) Protection

**What it does:**
- Fetches a CSRF token from the backend on app initialization
- Automatically includes the token in all state-changing requests (POST, PUT, DELETE, PATCH)
- Re-fetches token automatically if it expires (403 error)

**How it works:**
```javascript
// Automatic in apiClient interceptors:
1. GET /api/auth/csrf-token -> receives csrfToken
2. csrfToken stored in sessionStorage and tokenStore
3. All POST/PUT/DELETE requests include: x-csrf-token header
4. If 403 received, token is refreshed and request retried
```

**Implementation Location:**
- `src/api/apiClient.js` - CSRF token management and request/response interceptors
- `src/App.jsx` - Initialize CSRF token on app load

### 2. HTTPS/TLS Enforcement

**Local Development:**
- Frontend: HTTPS on `https://localhost:3000` (self-signed cert via vue-basic-ssl)
- Backend: HTTPS on `https://localhost:5000` (self-signed cert)
- Vite proxy: Routes `/api` → `https://localhost:5000`

**Production:**
- Use real certificates (Let's Encrypt, AWS ACM, etc.)
- Set `VITE_API_URL` to production HTTPS URL
- Enable HSTS (already configured in backend)

### 3. Content Security Policy (CSP)

**Backend sets:**
- `Content-Security-Policy: default-src 'self'`
- Prevents inline scripts and external resource loading
- Blocks XSS attacks

**Frontend follows:**
- No inline scripts in HTML
- All styles/scripts in separate files
- Dynamic content sanitized via React (auto-escaping)

### 4. XSS Prevention

**React handles:**
- Auto-escapes all template content
- Prevents script injection in JSX
- Uses MUI for safe component rendering

**Additional measures:**
- All user inputs validated before use
- File uploads validated (type/size checking)
- Form inputs type-checked via Zod schemas

### 5. Authentication Token Management

**Access Token:**
- Stored in memory only (not localStorage)
- Automatically included in Authorization header
- Expires based on backend config (typically 15 min)

**Refresh Token:**
- Stored in sessionStorage (persists across page reloads)
- Never stored in localStorage (localStorage survives browser close)
- Automatically refreshed when access token expires

**CSRF Token:**
- Stored in sessionStorage
- Cached to avoid excessive API calls
- Auto-refreshed if expired

## 🔄 API Request Flow

```
1. User action (create task, login, etc.)
   ↓
2. apiClient.post/put/delete() called
   ↓
3. Request interceptor adds:
   - Authorization: Bearer {accessToken}
   - x-csrf-token: {csrfToken}
   ↓
4. Request sent to backend
   ↓
5. Backend validates CSRF token and processes
   ↓
6. Response received
   ↓
7. If 401: Refresh token → retry with new accessToken
   If 403: Fetch new CSRF token → retry with new token
   Otherwise: Return response
```

## 📝 Adding New API Endpoints

When adding new API endpoints that modify data (POST/PUT/DELETE), no additional code needed! The apiClient automatically handles:

```javascript
// Example - just use apiClient normally:
const response = await apiClient.post('/api/tasks', taskData);
// CSRF token automatically included in x-csrf-token header
```

## 🧪 Testing Security

### Test CSRF Protection
```bash
# Without CSRF token - should fail with 403
curl -X POST https://localhost:5000/api/tasks \
  -H "Authorization: Bearer {token}" \
  -d '{"name":"test"}'
# Expected: 403 Forbidden

# With CSRF token - should succeed
curl -X POST https://localhost:5000/api/tasks \
  -H "Authorization: Bearer {token}" \
  -H "x-csrf-token: {csrfToken}" \
  -d '{"name":"test"}'
# Expected: 201 Created
```

### Test Certificate Setup
```bash
# Check certificate info
openssl x509 -in ssl/cert.pem -text -noout

# Verify HTTPS is working
curl -k https://localhost:3000  # Frontend
curl -k https://localhost:5000  # Backend
```

### Test Token Expiry Handling
1. Get CSRF token: `GET /api/auth/csrf-token`
2. Wait for token to expire (1 hour default)
3. Make POST request with expired token
4. Should see 403, then automatic token refresh, then retry succeeds

## 🚀 Environment Setup

### Development
```bash
# .env.local
VITE_API_URL=/api
VITE_FRONTEND_URL=https://localhost:3000
```

### Production
```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com
VITE_FRONTEND_URL=https://yourdomain.com
```

## 📊 Security Headers Checked

**Browser sends:**
- ✅ Secure cookies (Secure flag)
- ✅ withCredentials: true (for CORS cookies)
- ✅ x-csrf-token header (POST/PUT/DELETE)
- ✅ Authorization header (all requests)

**Backend responds with:**
- ✅ Content-Security-Policy
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ Strict-Transport-Security (HSTS)
- ✅ Referrer-Policy: strict-origin-when-cross-origin

## 🔒 Session Security

**SessionStorage Usage:**
- Persists across page reloads in same tab
- Cleared when tab closes
- Not accessible from other tabs
- Not vulnerable to XSS if CSP is enforced

**Memory Storage:**
- Access token stored in memory
- Lost on page reload (must re-login or use refresh token)
- Most secure option, requires balance

## ⚠️ Common Issues & Solutions

### Issue: "CSRF token invalid" (403 errors)
**Solution:**
- Browser must accept self-signed certs (in dev)
- CSRF token auto-refreshes on 403
- Check backend is running on HTTPS

### Issue: "Network error" on localhost
**Solution:**
- Check backend is running: `npm start`
- Check frontend proxy in vite.config.js points to `https://localhost:5000`
- Clear browser cache and reload

### Issue: TokenExpired errors
**Solution:**
- Access token expires after ~15 min (backend config)
- Refresh token is used automatically
- If no refresh token, user is logged out

### Issue: File upload fails
**Solution:**
- MaxFileSize: 5MB (configured in frontend)
- Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG
- CSRF token included automatically

## 📚 Related Files

- `src/api/apiClient.js` - Core API client with security
- `src/App.jsx` - Initialize CSRF on app load
- `src/api/authService.js` - Auth endpoints (login, signup, logout)
- `vite.config.js` - HTTPS and proxy configuration
- `.env.local` - Environment variables (dev)
- `Backend: SECURITY_BACKEND.md` - Backend security details

## 🚦 Deployment Checklist

- [ ] Update API URLs to production HTTPS domain
- [ ] Generate real SSL certificates (Let's Encrypt)
- [ ] Update CSRF_SECRET in backend .env
- [ ] Set CORS_ORIGIN to production frontend URL
- [ ] Test all auth flows (login, signup, refresh)
- [ ] Test all API operations (create, edit, delete)
- [ ] Check browser console for any CORS errors
- [ ] Verify HTTPS working with valid certs
- [ ] Enable HSTS headers in production
- [ ] Test rate limiting is working
- [ ] Monitor for CSRF/XSS attempts in logs

## 🎯 Best Practices

1. **Never bypass CSRF protection** - always use apiClient for API calls
2. **Never store sensitive data in localStorage** - use sessionStorage/memory
3. **Always validate user inputs** - use Zod schemas
4. **Test with real HTTPS** - even in dev, to catch cert issues early
5. **Monitor error logs** - watch for repeated 403 errors (attack indicators)
6. **Update dependencies** - keep React, MUI, axios patched
7. **Use trusted CSP headers** - don't disable CSP, work within it

## 📞 Contact & Support

For security issues, do not create public issues. Report privately to the development team.
