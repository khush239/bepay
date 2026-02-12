@echo off
echo Starting bepay platform...

start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"

echo Backend running on port 5000
echo Frontend running on port 5173
echo Opening browser...
timeout /t 5
start http://localhost:5173/login
