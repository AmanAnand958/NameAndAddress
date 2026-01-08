#!/bin/bash
trap "kill 0" EXIT

# Start the backend
echo "Starting Flask Backend..."
python hello.py &

# Start the frontend
echo "Starting React Frontend..."
cd frontend && npm run dev

wait
