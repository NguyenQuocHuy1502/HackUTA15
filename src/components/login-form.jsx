import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import googleLogo from '../assets/google.png'
import microsoftLogo from '../assets/Microsoft_logo.svg.png'
import LoginButton from './LoginButton'
import SignUpButton from './SignUpButton'
import RoleSelectionModal from './RoleSelectionModal'

export function LoginForm({
  className,
  onRoleChange,
  ...props
}) {
  const { loginWithRedirect, isLoading, error } = useAuth0()
  const [isSignUp, setIsSignUp] = useState(false)
  const [selectedRole, setSelectedRole] = useState('business')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [pendingAuthAction, setPendingAuthAction] = useState(null)
  
  const handleRoleChange = (e) => {
    const role = e.target.value;
    console.log('Role changed to:', role); // Debug log
    setSelectedRole(role);
    if (onRoleChange) {
      onRoleChange(role);
    }
  };

  const handleRoleSelected = (role) => {
    console.log('Role selected from modal:', role);
    setSelectedRole(role);
    if (onRoleChange) {
      onRoleChange(role);
    }
    
    // Execute the pending authentication action
    if (pendingAuthAction) {
      pendingAuthAction(role);
      setPendingAuthAction(null);
    }
  };

  const showRoleSelectionModal = (authAction) => {
    console.log('Showing role selection modal');
    setPendingAuthAction(() => authAction);
    setShowRoleModal(true);
  };

  const handleSignUp = () => {
    console.log('Sign up clicked - showing role modal')
    showRoleSelectionModal((role) => {
      localStorage.setItem('selectedRole', role);
      loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup'
        }
      });
    });
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
              <label>Account Type</label>
              <div style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '2px solid #86c98a',
                textAlign: 'center'
              }}>
                <div style={{fontSize: '16px', fontWeight: 'bold', color: '#2d3748', marginBottom: '10px'}}>
                  Current Selection: <span style={{color: selectedRole === 'business' ? '#86c98a' : '#3b82f6'}}>
                    {selectedRole === 'business' ? 'Restaurant Owner' : 'Pickup Organization'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(true)}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    backgroundColor: '#86c98a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Choose Account Type
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required />
            </div>
            <div className="form-group">
              {!isSignUp ? (
                <div className="auth-buttons">
                  <LoginButton selectedRole={selectedRole} />
                  <div style={{fontSize: '10px', color: '#999', marginTop: '5px'}}>
                    Will login as: {selectedRole}
                  </div>
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
                  <SignUpButton selectedRole={selectedRole} />
                  <div style={{fontSize: '10px', color: '#999', marginTop: '5px'}}>
                    Will signup as: {selectedRole}
                  </div>
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
                    onClick={() => {
                      console.log('Google login clicked - showing role modal')
                      showRoleSelectionModal((role) => {
                        localStorage.setItem('selectedRole', role);
                        loginWithRedirect({
                          authorizationParams: {
                            connection: 'google-oauth2'
                          }
                        });
                      });
                    }}
                  >
                    <img src={googleLogo} alt="Google" className="social-logo" />
                    Login with Google
                  </button>
                  
                  <button 
                    type="button" 
                    className="social-button microsoft-button"
                    onClick={() => {
                      console.log('Microsoft login clicked - showing role modal')
                      showRoleSelectionModal((role) => {
                        localStorage.setItem('selectedRole', role);
                        loginWithRedirect({
                          authorizationParams: {
                            connection: 'windowslive'
                          }
                        });
                      });
                    }}
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
                    onClick={() => {
                      console.log('Google signup clicked - showing role modal')
                      showRoleSelectionModal((role) => {
                        localStorage.setItem('selectedRole', role);
                        loginWithRedirect({
                          authorizationParams: {
                            connection: 'google-oauth2',
                            screen_hint: 'signup'
                          }
                        });
                      });
                    }}
                  >
                    <img src={googleLogo} alt="Google" className="social-logo" />
                    Sign up with Google
                  </button>
                  
                  <button 
                    type="button" 
                    className="social-button microsoft-button"
                    onClick={() => {
                      console.log('Microsoft signup clicked - showing role modal')
                      showRoleSelectionModal((role) => {
                        localStorage.setItem('selectedRole', role);
                        loginWithRedirect({
                          authorizationParams: {
                            connection: 'windowslive',
                            screen_hint: 'signup'
                          }
                        });
                      });
                    }}
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
      
      <RoleSelectionModal 
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onRoleSelected={handleRoleSelected}
      />
    </div>
  )
}
