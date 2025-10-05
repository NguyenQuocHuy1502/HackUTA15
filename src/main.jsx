import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN || "dev-6yegtp5vi30dzp47.us.auth0.com"}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || "L96DKwg1TCHj6j76TX63wtEQKWhqnFWQ"}
      authorizationParams={{
        redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin,
        prompt: 'login' // Force login every time
      }}
      cacheLocation="memory" // Don't persist auth state
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
)
