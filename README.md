# Feco - Food Waste Reduction App

A React application built with Vite that helps reduce food waste by connecting leftover food from restaurants and businesses with those in need.

## Features

- **Authentication**: Secure sign-in/sign-up using Auth0
- **User Dashboard**: Personalized dashboard showing user stats
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with green theme

## Auth0 Setup Instructions

To use this application, you need to set up Auth0:

### 1. Create Auth0 Account
1. Go to [auth0.com](https://auth0.com) and create a free account
2. Create a new application in your Auth0 dashboard
3. Choose "Single Page Application" as the application type

### 2. Configure Auth0 Application
1. In your Auth0 dashboard, go to Applications → Your App
2. Note down your **Domain** and **Client ID**
3. Add `http://localhost:5173` to your **Allowed Callback URLs**
4. Add `http://localhost:5173` to your **Allowed Logout URLs**
5. Add `http://localhost:5173` to your **Allowed Web Origins**

### 3. Enable Social Connections (Google & Facebook)
1. In your Auth0 dashboard, go to **Authentication** → **Social**
2. **For Google:**
   - Click on **Google**
   - Enable the connection
   - You'll need to create a Google OAuth app in Google Cloud Console
   - Add your Google Client ID and Client Secret to Auth0
3. **For Facebook:**
   - Click on **Facebook**
   - Enable the connection
   - You'll need to create a Facebook App in Facebook Developers
   - Add your Facebook App ID and App Secret to Auth0

### 4. Update Environment Variables
1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Auth0 credentials:

```
VITE_AUTH0_DOMAIN=your-actual-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-actual-client-id
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
```

### 5. Run the Application
```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── App.jsx          # Main application component with Auth0 integration
├── App.css          # Styling for authentication and dashboard
├── main.jsx         # Entry point with Auth0Provider
└── assets/
    └── organic.jpg  # Background image for authentication page
```

## Authentication Flow

1. **Unauthenticated State**: Shows sign-in/sign-up form with Google and Facebook options
2. **Loading State**: Shows spinner while Auth0 processes authentication
3. **Authenticated State**: Shows blank welcome page with logout option

## Technologies Used

- **React 19** - Frontend framework
- **Vite** - Build tool and development server
- **Auth0** - Authentication service
- **CSS3** - Styling with modern features (backdrop-filter, grid, flexbox)

## Development

The application uses Auth0's React SDK for authentication. When users click "Sign in with Google" or "Sign in with Facebook", they're redirected to Auth0's hosted login page with the specific social provider, and upon successful authentication, they're redirected back to the application's blank welcome page.

## Environment Variables

Make sure to set up your `.env` file with the correct Auth0 credentials before running the application. The `.env` file is already included in `.gitignore` for security.