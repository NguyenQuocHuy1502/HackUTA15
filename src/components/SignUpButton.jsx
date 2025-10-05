import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const SignUpButton = ({ selectedRole }) => {
  const { loginWithRedirect } = useAuth0();

  const handleSignUp = () => {
    console.log('SignUpButton clicked with role:', selectedRole); // Debug log
    
    // Get role from localStorage if not passed as prop
    const role = selectedRole || localStorage.getItem('selectedRole');
    console.log('Using role:', role);
    
    // Store the selected role before redirecting to Auth0
    localStorage.setItem('selectedRole', role);
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup'
      }
    });
  };

  return (
    <button onClick={handleSignUp}>
      Sign Up
    </button>
  );
};

export default SignUpButton;
