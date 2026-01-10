#!/bin/bash
trap "kill 0" EXIT

# Start the backend
echo "Starting Flask Backend..."
python backend/app.py &

# Start the frontend
echo "Starting React Frontend..."
cd frontend && npm run dev

wait
