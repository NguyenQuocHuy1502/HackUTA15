import React, { useState } from 'react';

const RoleSelectionPage = ({ onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    console.log('Role selected:', role);
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      console.log('Continuing with role:', selectedRole);
      localStorage.setItem('selectedRole', selectedRole);
      onRoleSelected(selectedRole);
    } else {
      alert('Please select a role first!');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#2d3748',
          marginBottom: '10px'
        }}>
          Welcome to FECO
        </div>
        
        <div style={{
          fontSize: '18px',
          color: '#718096',
          marginBottom: '40px'
        }}>
          Choose your account type to get started
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div 
            onClick={() => handleRoleSelect('business')}
            style={{
              padding: '25px',
              border: selectedRole === 'business' ? '4px solid #86c98a' : '2px solid #e2e8f0',
              borderRadius: '15px',
              backgroundColor: selectedRole === 'business' ? '#f0fff4' : 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: selectedRole === 'business' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: selectedRole === 'business' ? '0 10px 20px rgba(134, 201, 138, 0.3)' : '0 5px 15px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{
              fontSize: '24px',
              marginBottom: '10px'
            }}>
              🏪
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              Restaurant Owner
            </div>
            <div style={{
              fontSize: '14px',
              color: '#718096',
              lineHeight: '1.5'
            }}>
              Restaurants, Grocery Stores, Caterers<br/>
              Track food waste and manage inventory
            </div>
          </div>

          <div 
            onClick={() => handleRoleSelect('pickup')}
            style={{
              padding: '25px',
              border: selectedRole === 'pickup' ? '4px solid #3b82f6' : '2px solid #e2e8f0',
              borderRadius: '15px',
              backgroundColor: selectedRole === 'pickup' ? '#f0f9ff' : 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: selectedRole === 'pickup' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: selectedRole === 'pickup' ? '0 10px 20px rgba(59, 130, 246, 0.3)' : '0 5px 15px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{
              fontSize: '24px',
              marginBottom: '10px'
            }}>
              🚚
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              Pickup Organization
            </div>
            <div style={{
              fontSize: '14px',
              color: '#718096',
              lineHeight: '1.5'
            }}>
              Food Banks, Community Organizations<br/>
              Find and collect surplus food from restaurants
            </div>
          </div>
        </div>

        {selectedRole && (
          <div style={{
            fontSize: '16px',
            color: '#4a5568',
            marginBottom: '30px',
            fontWeight: '500',
            padding: '15px',
            backgroundColor: '#f7fafc',
            borderRadius: '10px',
            border: '2px solid #e2e8f0'
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

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: selectedRole ? (selectedRole === 'business' ? '#86c98a' : '#3b82f6') : '#cbd5e0',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: selectedRole ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            opacity: selectedRole ? 1 : 0.6,
            boxShadow: selectedRole ? '0 5px 15px rgba(0, 0, 0, 0.2)' : 'none'
          }}
        >
          Continue to {selectedRole === 'business' ? 'Restaurant' : 'Pickup'} Login
        </button>

        <div style={{
          marginTop: '20px',
          fontSize: '12px',
          color: '#a0aec0'
        }}>
          You can change this selection later in your account settings
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
