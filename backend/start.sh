#!/bin/bash

echo "🎮 Starting Poul Le Fun Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import flask" 2>/dev/null; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    echo "✓ Dependencies already installed"
fi

# Run the app
echo ""
echo "🚀 Starting Flask server on http://localhost:5000"
echo ""
python app.py
