# CSRF 500 Error Troubleshooting

## Error Analysis
- Frontend calling: `/api/csrf-token` ✅ (just fixed)
- Backend providing: `/api/csrf-token` ✅ (implemented in app.js)
- Status: 500 (Server Error) - Backend is returning an error

## Diagnostic Steps

### Step 1: Verify Backend Is Running
```bash
# In a terminal, check if backend responds
curl -k https://localhost:5000/api/test

# Expected output:
# {"message":"Backend working"}

# If this fails, backend isn't running or not accessible
```

### Step 2: Start Backend (if not running)
```bash
cd ../Software-Sec-Project-backend
npm start

# Should see something like:
# ✅ Server running on https://localhost:5000
```

### Step 3: Test CSRF Endpoint Directly
```bash
# Test CSRF endpoint from backend
curl -k https://localhost:5000/api/csrf-token

# Expected: {"csrfToken":"hexstringhexstringhexstring"}
# If 500: Backend error - check backend console for details
```

### Step 4: Check Backend Logs
Look at the terminal running the backend server. Errors during CSRF token generation will be logged there.

Common errors:
- **Database connection error**: MySQL not running or credentials wrong
- **Missing environment variables**: Check backend `.env`
- **CSRF_SECRET missing**: Should be set in backend `.env`

### Step 5: Verify Backend .env Configuration
Check `/Software-Sec-Project-backend/.env`:
```
# MUST have these set:
CSRF_SECRET=your_csrf_secret_key_min_32_chars_change_in_production
DB_HOST=localhost
DB_USER=mihir
DB_PASSWORD=software_sec
DB_NAME=secure_app
PORT=5000
FRONTEND_URL=https://localhost:3000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

### Step 6: Ensure Database Is Running
```bash
# Check if MySQL is running (Linux)
sudo systemctl status mysql

# Or start MySQL
sudo systemctl start mysql

# Test MySQL connection
mysql -u mihir -p -h localhost secure_app

# Password: software_sec
```

## Solution Summary

| Issue | Solution |
|-------|----------|
| Backend not running | `cd ../Software-Sec-Project-backend && npm start` |
| Database not running | `sudo systemctl start mysql` |
| Database credentials wrong | Update backend `.env` with correct DB credentials |
| CSRF endpoint returning 500 | Check backend console for detailed error message |
| Still failing after fixes | Restart both backend and frontend |

## Frontend Side (Already Fixed)
✅ Changed CSRF endpoint from `/api/auth/csrf-token` to `/api/csrf-token`
✅ App gracefully handles CSRF initialization failures (doesn't block login)

## Testing Login After Fix

1. Start backend and frontend
2. Open https://localhost:3000
3. Accept certificate warning
4. Try login with: admin@heremes.com / Admin@123
5. If successful: ✅ CSRF setup is working
6. Check DevTools → Network tab → See POST /api/auth/login request
7. Look for header: `x-csrf-token: [value]`
