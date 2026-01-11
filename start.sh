#!/bin/bash

# Ensure we are in the directory where the script is located
cd "$(dirname "$0")"

# Function to kill background processes on exit
cleanup() {
    echo "Stopping services..."
    kill $(jobs -p) 2>/dev/null
}
trap cleanup EXIT

# Start the backend
echo "Starting Flask Backend..."
# Use the virtual environment Python explicitly
source .venv/bin/activate
export FLASK_APP=backend/app.py
export FLASK_ENV=development
python backend/app.py &
BACKEND_PID=$!

# Start the frontend
echo "Starting React Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
