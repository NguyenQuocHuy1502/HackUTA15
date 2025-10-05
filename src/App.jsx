import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import './App.css'
import organicImage from './assets/organic.jpg'
import LoginButton from './components/LoginButton'
import LogoutButton from './components/LogoutButton'
import Profile from './components/Profile'
import RestaurantPage from './pages/RestaurantPage'
import PickUpPage from './pages/PickUpPage'
import { useAuthWithRestaurant } from './hooks/useAuthWithRestaurant'

function App() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const { loginWithRedirect, logout, isLoading, error } = useAuth0()
  const { user, isAuthenticated, restaurantId, isRestaurantReady, restaurantError, userRole } = useAuthWithRestaurant()
  
  // Debug logging
  console.log('Auth0 State:', { isLoading, isAuthenticated, error, user, restaurantId, isRestaurantReady, userRole })
  console.log('Role Selection State:', { selectedRole })

  const handleRoleSelected = (role) => {
    console.log('Role selected in App:', role)
    setSelectedRole(role)
    localStorage.setItem('selectedRole', role)
    console.log('Role stored in localStorage:', role)
  }

  if (error || restaurantError) {
    return (
      <div className="app">
        <div className="error-container">
          <h1>Authentication Error</h1>
          <p>Error: {error?.message || restaurantError}</p>
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

  if (isAuthenticated && isRestaurantReady) {
    return (
      <div className="app">
        <div className="authenticated-layout">
          <div className="user-header">
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <span style={{fontSize: '14px', color: '#666'}}>
                {userRole === 'pickup' ? '🚚 Pickup Organization' : '🏪 Restaurant Owner'}
              </span>
              <button 
                onClick={() => {
                  setSelectedRole(null)
                  localStorage.removeItem('selectedRole')
                }}
                style={{
                  padding: '5px 10px',
                  fontSize: '12px',
                  backgroundColor: '#e2e8f0',
                  border: '1px solid #cbd5e0',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Change Role
              </button>
            </div>
            <LogoutButton />
          </div>
          {userRole === 'pickup' ? (
            <PickUpPage />
          ) : (
            <RestaurantPage restaurantId={restaurantId} />
          )}
        </div>
      </div>
    )
  }

  // Show loading if authenticated but profile not ready yet
  if (isAuthenticated && !isRestaurantReady) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Setting up your {userRole === 'pickup' ? 'pickup organization' : 'restaurant'} profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app" style={{'--organic-bg': `url(${organicImage})`}}>
      {/* Full Page Left Side Content */}
      <div className="full-page-content">
        <div className="image-content">
          <h1>Feco</h1>
          <h2>Reducing Food Waste, Nourishing Communities</h2>
          <p>
          Stop wasting food and losing revenue. Feco revolutionizes food management by empowering businesses to track their inventory, help those in need, and connect with local charities for surplus food pickup. With AI-powered suggestions by learning your operational trends, our AI recommends precise storage adjustments, turning data into significant savings.
          </p>
          
          {/* Role Selection Buttons */}
          <div style={{
            marginTop: '30px',
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexDirection: 'row'
          }}>
            <button
              onClick={() => handleRoleSelected('business')}
              style={{
                padding: '20px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: selectedRole === 'business' ? '#86c98a' : 'rgba(255, 255, 255, 0.9)',
                color: selectedRole === 'business' ? 'white' : '#2d3748',
                border: selectedRole === 'business' ? '3px solid #86c98a' : '2px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: selectedRole === 'business' ? 'scale(1.05)' : 'scale(1)',
                boxShadow: selectedRole === 'business' ? '0 10px 20px rgba(134, 201, 138, 0.4)' : '0 5px 15px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              Restaurant Owner
            </button>
            
            <button
              onClick={() => handleRoleSelected('pickup')}
              style={{
                padding: '20px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: selectedRole === 'pickup' ? '#3b82f6' : 'rgba(255, 255, 255, 0.9)',
                color: selectedRole === 'pickup' ? 'white' : '#2d3748',
                border: selectedRole === 'pickup' ? '3px solid #3b82f6' : '2px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: selectedRole === 'pickup' ? 'scale(1.05)' : 'scale(1)',
                boxShadow: selectedRole === 'pickup' ? '0 10px 20px rgba(59, 130, 246, 0.4)' : '0 5px 15px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              Pickup Organization
            </button>
          </div>
          
          {selectedRole && (
            <div style={{
              marginTop: '20px',
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              fontWeight: '500',
              padding: '15px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              Selected: <span style={{
                color: selectedRole === 'business' ? '#86c98a' : '#3b82f6',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                {selectedRole === 'business' ? 'Restaurant Owner' : 'Pickup Organization'}
              </span>
            </div>
          )}
          
          {selectedRole && (
            <div style={{
              marginTop: '20px',
              textAlign: 'center'
            }}>
              <button
                onClick={() => loginWithRedirect({ prompt: 'login' })}
                style={{
                  padding: '15px 40px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(16, 185, 129, 0.4)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                Sign In
              </button>
            </div>
          )}
          
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
