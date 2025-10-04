import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import './App.css'
import organicImage from './assets/organic.jpg'
import LoginButton from './components/LoginButton'
import LogoutButton from './components/LogoutButton'
import Profile from './components/Profile'
import FoodWasteForm from './components/FoodWasteForm'
import RestaurantPage from './pages/RestaurantPage'

function App() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading, error } = useAuth0()
  
  // Debug logging
  console.log('Auth0 State:', { isLoading, isAuthenticated, error, user })

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <h1>Authentication Error</h1>
          <p>Error: {error.message}</p>
          <p>Please check your Auth0 configuration.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="app">
        {!showForm ? (
          <div className="authenticated-layout">
            <div className="user-header">
              <LogoutButton />
            </div>
            <RestaurantPage onAddWaste={() => setShowForm(true)} />
          </div>
        ) : (
          <div className="form-container">
            <div className="form-header-actions">
              <button 
                className="back-button"
                onClick={() => setShowForm(false)}
              >
                ← Back to Restaurant Page
              </button>
            </div>
            <FoodWasteForm />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app" style={{'--organic-bg': `url(${organicImage})`}}>
      {/* Top Right Sign In Button */}
      <div className="top-right-signin">
        <LoginButton />
      </div>
      
      {/* Full Page Left Side Content */}
      <div className="full-page-content">
        <div className="image-content">
          <h1>Feco</h1>
          <h2>Reducing Food Waste, Nourishing Communities</h2>
          <p>
            Connect leftover food from restaurants and businesses with those in need. 
            Together, we can reduce food waste and fight hunger in our community.
          </p>
          <div className="stats">
            <div className="stat">
              <div className="stat-number">40%</div>
              <div className="stat-label">of food waste reduced</div>
            </div>
            <div className="stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">meals saved daily</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
