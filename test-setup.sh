#!/bin/bash

# 🔍 Frontend & Backend Diagnostic Script

echo "========================================"
echo "🔍 DIAGNOSTIC TEST SUITE"
echo "========================================"
echo ""

# Test 1: Backend API Connection
echo "1️⃣  Testing Backend Connection..."
echo "Running: curl http://localhost:5000/api/test"
echo ""

BACKEND_TEST=$(curl -s http://localhost:5000/api/test 2>&1)
if [[ $BACKEND_TEST == *"Backend working"* ]]; then
  echo "✅ Backend is RUNNING"
  echo "Response: $BACKEND_TEST"
  echo ""
else
  echo "❌ Backend is NOT RUNNING"
  echo "Error: $BACKEND_TEST"
  echo ""
  echo "FIX: Start backend in terminal:"
  echo "cd backend && node server.js"
  echo ""
fi

# Test 2: MySQL Connection
echo "2️⃣  Testing MySQL Connection..."
echo "Running: mysql -u mihir -p secure_app -e 'SELECT 1;' (password hidden)"
echo ""

MYSQL_TEST=$(mysql -u mihir -p -e "SELECT 1;" 2>&1)
if [[ $MYSQL_TEST == *"1"* ]]; then
  echo "✅ MySQL is RUNNING"
  echo ""
else
  echo "❌ MySQL is NOT RUNNING or wrong password"
  echo "$MYSQL_TEST"
  echo ""
  echo "FIX: Start MySQL:"
  echo "sudo systemctl start mysql"
  echo ""
fi

# Test 3: Frontend .env.local
echo "3️⃣  Checking Frontend Configuration..."
if [ -f ".env.local" ]; then
  echo "✅ .env.local EXISTS"
  cat .env.local
  echo ""
else
  echo "❌ .env.local MISSING"
  echo ""
  echo "FIX: Create it:"
  echo "echo 'VITE_API_URL=http://localhost:5000/api' > .env.local"
  echo ""
fi

# Test 4: Backend .env
echo "4️⃣  Checking Backend Configuration..."
if [ -f "backend/.env" ]; then
  echo "✅ backend/.env EXISTS"
  echo "Checking required variables..."
  echo ""
  cat backend/.env | grep -E "DB_|JWT_|FRONTEND_URL|NODE_ENV" | sed 's/=.*/=***/'
  echo ""
else
  echo "❌ backend/.env MISSING"
  echo ""
  echo "FIX: Create it:"
  echo "cd backend && cp .env.example .env && nano .env"
  echo ""
fi

# Test 5: Test Signup Endpoint
echo "5️⃣  Testing Signup Endpoint..."
echo "Running: curl -X POST http://localhost:5000/api/auth/signup"
echo ""

SIGNUP_TEST=$(curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test'$(date +%s)'@example.com","password":"Test@12345"}' 2>&1)

echo "Response: $SIGNUP_TEST"
echo ""

if [[ $SIGNUP_TEST == *"message"* ]]; then
  echo "✅ Backend API is responding"
else
  echo "❌ Backend not responding properly"
  echo "Check backend terminal for errors"
fi

echo ""
echo "========================================"
echo "📋 SUMMARY"
echo "========================================"
echo ""
echo "If any tests failed above:"
echo "1. Fix the issue shown in red (❌)"
echo "2. Restart: yarn start"
echo "3. Try signup again"
echo ""
echo "If all tests pass but signup still fails:"
echo "1. Open DevTools (F12)"
echo "2. Go to Network tab"
echo "3. Try signup"
echo "4. Look at POST /api/auth/signup response"
echo "5. Send me the error from Response tab"
echo ""
