import React, { useState } from 'react';

const RoleSelectionModal = ({ isOpen, onClose, onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState('business');

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    console.log('Role selected in modal:', role);
  };

  const handleConfirm = () => {
    console.log('Confirming role selection:', selectedRole);
    localStorage.setItem('selectedRole', selectedRole);
    onRoleSelected(selectedRole);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#2d3748',
          marginBottom: '20px'
        }}>
          Choose Your Account Type
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: '#718096',
          marginBottom: '30px'
        }}>
          Please select the type of account you want to create:
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div 
            onClick={() => handleRoleChange('business')}
            style={{
              padding: '20px',
              border: selectedRole === 'business' ? '3px solid #86c98a' : '2px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: selectedRole === 'business' ? '#f0fff4' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#2d3748',
              marginBottom: '5px'
            }}>
              🏪 Restaurant Owner
            </div>
            <div style={{
              fontSize: '14px',
              color: '#718096'
            }}>
              Restaurants, Grocery Stores, Caterers
            </div>
          </div>

          <div 
            onClick={() => handleRoleChange('pickup')}
            style={{
              padding: '20px',
              border: selectedRole === 'pickup' ? '3px solid #3b82f6' : '2px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: selectedRole === 'pickup' ? '#f0f9ff' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#2d3748',
              marginBottom: '5px'
            }}>
              🚚 Pickup Organization
            </div>
            <div style={{
              fontSize: '14px',
              color: '#718096'
            }}>
              Food Banks, Community Organizations
            </div>
          </div>
        </div>

        <div style={{
          fontSize: '14px',
          color: '#4a5568',
          marginBottom: '20px',
          fontWeight: '500'
        }}>
          Selected: <span style={{
            color: selectedRole === 'business' ? '#86c98a' : '#3b82f6',
            fontWeight: 'bold'
          }}>
            {selectedRole === 'business' ? 'Restaurant Owner' : 'Pickup Organization'}
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#e2e8f0',
              color: '#4a5568',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: selectedRole === 'business' ? '#86c98a' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
