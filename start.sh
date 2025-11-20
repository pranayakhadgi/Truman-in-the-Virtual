#!/bin/bash
# Start script for Truman Virtual Tour

echo "🚀 Starting Truman Virtual Tour..."
echo ""

# Check if ports are in use
if lsof -ti :8000 > /dev/null 2>&1; then
    echo "⚠️  Port 8000 is already in use. Killing existing process..."
    lsof -ti :8000 | xargs kill -9 2>/dev/null
    sleep 1
fi

if lsof -ti :3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 is already in use. Killing existing process..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "📦 Starting Backend Server (Port 3000)..."
cd Backend
npm start &
BACKEND_PID=$!
cd ..

sleep 2

echo "🌐 Starting Frontend Dev Server (Port 8000)..."
cd Frontend
python3 dev-server.py &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are starting!"
echo ""
echo "📱 Frontend: http://localhost:8000"
echo "🔧 Backend:  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
