#!/bin/bash

# Quick diagnostic script to check if backend is running and responding

echo "🔍 Checking Blood Donation System Setup..."
echo ""

# Check if backend is running
echo "1️⃣ Checking backend server on port 5000..."
if timeout 2 bash -c 'echo >/dev/tcp/localhost/5000' 2>/dev/null; then
    echo "✅ Backend is running on http://localhost:5000"
else
    echo "❌ Backend is NOT running on port 5000"
    echo "   Fix: Run 'npm start' in the backend folder"
fi

# Check if frontend is running
echo ""
echo "2️⃣ Checking frontend server on port 5173..."
if timeout 2 bash -c 'echo >/dev/tcp/localhost/5173' 2>/dev/null; then
    echo "✅ Frontend is running on http://localhost:5173"
else
    echo "⚠️ Frontend is NOT running on port 5173"
    echo "   Fix: Run 'npm run dev' in the frontend folder"
fi

echo ""
echo "3️⃣ Testing backend connectivity..."
if curl -s http://localhost:5000/auth/login -X POST -H "Content-Type: application/json" -d '{}' > /dev/null 2>&1; then
    echo "✅ Backend API is responding"
else
    echo "❌ Backend API is not responding"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Make sure both servers are running:"
echo "   Terminal 1: cd backend && npm start"
echo "   Terminal 2: cd frontend && npm run dev"
echo "2. Try adding a user with this test data:"
echo "   - Name: Test Donor"
echo "   - Email: testdonor@test.com"
echo "   - Password: test123 (must have letters AND numbers)"
echo "   - Role: donor"
echo "   - Blood Group: A+"
echo "3. Check the error message displayed on the form"
echo ""
