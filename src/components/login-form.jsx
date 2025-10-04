import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import googleLogo from '../assets/google.png'
import microsoftLogo from '../assets/Microsoft_logo.svg.png'
import LoginButton from './LoginButton'
import SignUpButton from './SignUpButton'

export function LoginForm({
  className,
  ...props
}) {
  const { loginWithRedirect, isLoading, error } = useAuth0()
  const [isSignUp, setIsSignUp] = useState(false)
  
  const handleLogin = () => {
    console.log('Login clicked')
    loginWithRedirect()
  }
  
  const handleSignUp = () => {
    console.log('Sign up clicked')
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup'
      }
    })
  }
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h3>Authentication Error</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-6 ${className || ''}`} {...props}>
      <div className="auth-card">
        <div className="auth-header">
          <h3>{isSignUp ? 'Create your account' : 'Login to your account'}</h3>
          <p>{isSignUp ? 'Enter your details below to create your account' : 'Enter your email below to login to your account'}</p>
        </div>
        <div className="auth-content">
          <form>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <div className="role-selection">
                <label className="role-option">
                  <input type="radio" name="role" value="business" />
                  <span>Business Owner</span>
                  <small>Restaurants, Grocery Stores, Caterers</small>
                </label>
                <label className="role-option">
                  <input type="radio" name="role" value="volunteer" />
                  <span>Volunteer</span>
                  <small>Food Banks, Community Organizations</small>
                </label>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required />
            </div>
            <div className="form-group">
              {!isSignUp ? (
                <div className="auth-buttons">
                  <LoginButton />
                  <button 
                    type="button" 
                    className="auth-button"
                    onClick={() => setIsSignUp(true)}
                  >
                    Switch to Sign Up
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <SignUpButton />
                  <button 
                    type="button" 
                    className="auth-button"
                    onClick={() => setIsSignUp(false)}
                  >
                    Switch to Login
                  </button>
                </div>
              )}
              
              {!isSignUp && (
                <>
                  <button 
                    type="button" 
                    className="social-button google-button"
                    onClick={() => loginWithRedirect({
                      authorizationParams: {
                        connection: 'google-oauth2'
                      }
                    })}
                  >
                    <img src={googleLogo} alt="Google" className="social-logo" />
                    Login with Google
                  </button>
                  
                  <button 
                    type="button" 
                    className="social-button microsoft-button"
                    onClick={() => loginWithRedirect({
                      authorizationParams: {
                        connection: 'windowslive'
                      }
                    })}
                  >
                    <img src={microsoftLogo} alt="Microsoft" className="social-logo" />
                    Login with Microsoft
                  </button>
                </>
              )}
              
              {isSignUp && (
                <div className="social-signup-buttons">
                  <button 
                    type="button" 
                    className="social-button google-button"
                    onClick={() => loginWithRedirect({
                      authorizationParams: {
                        connection: 'google-oauth2',
                        screen_hint: 'signup'
                      }
                    })}
                  >
                    <img src={googleLogo} alt="Google" className="social-logo" />
                    Sign up with Google
                  </button>
                  
                  <button 
                    type="button" 
                    className="social-button microsoft-button"
                    onClick={() => loginWithRedirect({
                      authorizationParams: {
                        connection: 'windowslive',
                        screen_hint: 'signup'
                      }
                    })}
                  >
                    <img src={microsoftLogo} alt="Microsoft" className="social-logo" />
                    Sign up with Microsoft
                  </button>
                </div>
              )}
              <p className="auth-footer-text">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
                <a href="#" onClick={() => setIsSignUp(!isSignUp)}>
                  {isSignUp ? ' Sign in' : ' Sign up'}
                </a>
              </p>
              
              {!isSignUp && (
                <div className="auth-links">
                  <a href="#" className="forgot-password">Forgot your password?</a>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
