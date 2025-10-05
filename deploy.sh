#!/bin/bash

# AI Interview Assistant - Quick Deploy Script

echo "🚀 AI Interview Assistant - Deployment Script"
echo "=============================================="

# Check if required tools are installed
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

echo "✅ Prerequisites satisfied"

# Install dependencies
echo "📦 Installing dependencies..."
echo "   Installing backend dependencies..."
cd server && npm install

echo "   Installing frontend dependencies..."
cd ../client && npm install

cd ..

# Check environment files
echo "🔧 Checking environment configuration..."
if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found. Please create it with:"
    echo "   PORT=5000"
    echo "   MONGODB_URI=your_mongodb_uri"
    echo "   JWT_SECRET=your_jwt_secret"
    echo "   GEMINI_API_KEY=your_gemini_key"
    exit 1
fi

if [ ! -f "client/.env" ]; then
    echo "⚠️  client/.env not found. Creating default..."
    echo "VITE_API_URL=http://localhost:5000/api" > client/.env
fi

echo "✅ Environment configuration ready"

# Start services
echo "🚀 Starting services..."
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Start both frontend and backend
npm run dev