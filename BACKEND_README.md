# Feco Food Waste Tracking App

## Project Structure

This project consists of two parts:
1. **Frontend**: React app (Vite) - runs on port 5173/5174
2. **Backend**: Express server - runs on port 3001

## Backend Setup

The backend server saves daily import data to JSON files in the project directory.

### Prerequisites
- Node.js installed
- npm or yarn package manager

### Installation

1. **Install backend dependencies:**
   ```bash
   cd hackuta16
   cp backend-package.json package.json
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Verify server is running:**
   - Server should start on `http://localhost:3001`
   - You should see: "Server running on http://localhost:3001"
   - Data directory will be created at: `hackuta16/data/`

### API Endpoints

- **POST** `/api/save-daily-import` - Save daily import data
- **GET** `/api/daily-imports` - Get all saved daily imports
- **GET** `/api/daily-import/:date` - Get specific daily import by date
- **DELETE** `/api/daily-import/:date` - Delete specific daily import

### Data Storage

- **Location**: `hackuta16/data/` directory
- **Format**: JSON files named `daily-import-YYYY-MM-DD.json`
- **Structure**: Complete daily import data with recipes, categories, and totals

### Example Data File

```json
{
  "date": "2025-01-04",
  "timestamp": "2025-01-04T23:34:37.562Z",
  "recipes": [...],
  "importData": {
    "Meat": {
      "Chicken": 5.5,
      "Beef": 3.2
    },
    "Dairy": {
      "Milk": 2.0
    }
  },
  "totalImports": 10.7,
  "categories": ["Meat", "Dairy", "Greens", "Carbohydrates"]
}
```

## Frontend Setup

1. **Start the frontend:**
   ```bash
   cd hackuta16
   npm run dev
   ```

2. **Access the app:**
   - Open `http://localhost:5173` or `http://localhost:5174`
   - Login with Auth0
   - Navigate to Forms tab
   - Use "Save to Project" button to save data

## Usage

1. **Start both servers:**
   - Backend: `npm start` (in hackuta16 directory)
   - Frontend: `npm run dev` (in hackuta16 directory)

2. **Use the app:**
   - Login to the app
   - Go to Forms → Daily Import
   - Add recipes and food items
   - Click "Save to Project" to save data to project files

3. **View saved data:**
   - Check `hackuta16/data/` directory
   - Files are named by date: `daily-import-2025-01-04.json`

## Troubleshooting

- **"Failed to save data"**: Make sure backend server is running on port 3001
- **CORS errors**: Backend includes CORS middleware for frontend communication
- **Port conflicts**: Backend uses port 3001, frontend uses 5173/5174
- **File permissions**: Ensure the app has write permissions to create the data directory

