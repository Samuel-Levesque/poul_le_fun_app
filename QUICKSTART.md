# Quick Start Guide

## Step 1: Start the Backend

Open a terminal and run:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

You should see output like:
```
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on http://127.0.0.1:5000
```

**Keep this terminal open!**

## Step 2: Start the Frontend

Open a **new terminal** (keep the backend running) and run:

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

## Step 3: Open the App

Open your browser to: **http://localhost:5173**

## Troubleshooting

### "Failed to create teams" error

**Check 1: Is the backend running?**
- Look at your backend terminal - should show Flask is running on port 5000
- Visit http://localhost:5000/api/teams in your browser - should show `{"teams": []}`

**Check 2: Check browser console for errors**
- Press F12 in your browser
- Go to Console tab
- Look for red error messages
- Common errors:
  - `Network Error` or `ERR_CONNECTION_REFUSED` = Backend not running
  - `CORS error` = Backend CORS not configured (shouldn't happen with our setup)

**Check 3: Test the backend directly**
```bash
# In a new terminal, with backend venv activated:
cd backend
source venv/bin/activate
python test_backend.py
```

Should show:
```
✓ App created successfully!
✓ Database URI: sqlite:///database.db
...
```

**Check 4: Test API with curl**
```bash
curl -X POST http://localhost:5000/api/teams \
  -H "Content-Type: application/json" \
  -d '{"players": ["Alice", "Bob", "Charlie", "Diana"]}'
```

Should return JSON with created teams.

### Backend won't start

**Error: `ModuleNotFoundError: No module named 'flask'`**
- Solution: Make sure you activated the virtual environment
```bash
cd backend
source venv/bin/activate  # You should see (venv) in your prompt
pip install -r requirements.txt
```

**Error: `No module named 'database'`**
- Solution: Make sure you're running from the backend directory
```bash
cd backend  # Make sure you're in the backend folder
python app.py
```

### Frontend won't start

**Error: `npm: command not found`**
- Solution: Install Node.js from https://nodejs.org/

**Error: `Cannot find module`**
- Solution: Install dependencies
```bash
cd frontend
npm install
```

### Port already in use

**Error: `Address already in use`**
- Backend (port 5000):
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9
```

- Frontend (port 5173):
```bash
# Find and kill the process
lsof -ti:5173 | xargs kill -9
```

## Testing the Full Workflow

1. Go to http://localhost:5173
2. Click "Teams" in the navigation
3. Enter player names: `Alice, Bob, Charlie, Diana, Eve, Frank`
4. Click "Create Teams"
5. Should see 3 teams created!

If this works, everything is set up correctly! 🎉
