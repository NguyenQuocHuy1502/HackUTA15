import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { restaurantService, pickupService } from '../lib/supabaseService'

export const useAuthWithRestaurant = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth0()
  const [profileId, setProfileId] = useState(null)
  const [isProfileReady, setIsProfileReady] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [userRole, setUserRole] = useState('business') // Track user role

  useEffect(() => {
    console.log('useAuthWithRestaurant useEffect triggered:', { isAuthenticated, user: !!user, isLoading })
    
    const setupProfile = async () => {
      if (!isAuthenticated || !user) {
        console.log('Not authenticated or no user, setting profile ready to false')
        setIsProfileReady(false)
        setProfileId(null)
        return
      }

      try {
        // Get user role from localStorage (set during login/signup)
        const storedRole = localStorage.getItem('selectedRole') || 'business';
        console.log('Stored role from localStorage:', storedRole)
        console.log('All localStorage items:', Object.keys(localStorage).map(key => ({ key, value: localStorage.getItem(key) })))
        setUserRole(storedRole);
        
        console.log('Setting up profile for user:', user, 'Role:', storedRole)
        console.log('User object details:', {
          name: user.name,
          email: user.email,
          sub: user.sub,
          nickname: user.nickname,
          given_name: user.given_name,
          family_name: user.family_name
        })
        
        // Generate profile ID from user name
        const generatedProfileId = generateProfileIdFromUser(user)
        console.log('Generated profile ID:', generatedProfileId)

        if (storedRole === 'pickup') {
          console.log('🚚 PICKUP BRANCH: Creating pickup organization profile')
          // Handle pickup organization profile
          const existingPickup = await pickupService.getPickupById(generatedProfileId)
          
          if (existingPickup.success) {
            console.log('Pickup organization already exists:', existingPickup.data)
            setProfileId(existingPickup.data.pickup_id)
            setIsProfileReady(true)
            // Clear the stored role after successful pickup profile setup
            localStorage.removeItem('selectedRole');
            return
          }

          // Create new pickup organization if it doesn't exist
          console.log('Creating new pickup organization for user')
          const pickupData = {
            pickup_id: generatedProfileId,
            pickup_name: user.name || user.nickname || user.given_name || 'Pickup Organization',
            contact_person: user.name || user.nickname || 'Contact Person',
            phone_number: 'Phone not provided',
            email: user.email || user.sub || `${user.nickname || 'user'}@example.com`
          }

          const createResult = await pickupService.createPickupProfile(pickupData)

          if (createResult.success) {
            console.log('Pickup organization created successfully:', createResult.data)
            setProfileId(createResult.data.pickup_id)
            setIsProfileReady(true)
            // Clear the stored role after successful pickup profile setup
            localStorage.removeItem('selectedRole');
          } else {
            console.error('Failed to create pickup organization:', createResult.error)
            setProfileError(createResult.error)
            setIsProfileReady(false)
          }
        } else {
          console.log('🏪 RESTAURANT BRANCH: Creating restaurant profile')
          // Handle restaurant profile
          const existingRestaurant = await restaurantService.getRestaurantByEmail(user.email || user.sub)
          
          if (existingRestaurant.success) {
            console.log('Restaurant already exists:', existingRestaurant.data)
            setProfileId(existingRestaurant.data.restaurant_id)
            setIsProfileReady(true)
            // Clear the stored role after successful restaurant profile setup
            localStorage.removeItem('selectedRole');
            return
          }

          // Create new restaurant if it doesn't exist
          console.log('Creating new restaurant for user')
          const restaurantData = {
            name: user.name || user.nickname || user.given_name || 'Restaurant User',
            address: 'Address not provided',
            phone: 'Phone not provided',
            email: user.email || user.sub || `${user.nickname || 'user'}@example.com`
          }

          const createResult = await restaurantService.createRestaurantWithId(
            generatedProfileId, 
            restaurantData
          )

          if (createResult.success) {
            console.log('Restaurant created successfully:', createResult.data)
            setProfileId(createResult.data.restaurant_id)
            setIsProfileReady(true)
            // Clear the stored role after successful restaurant profile setup
            localStorage.removeItem('selectedRole');
          } else {
            console.error('Failed to create restaurant:', createResult.error)
            setProfileError(createResult.error)
            setIsProfileReady(false)
          }
        }

        console.log('Profile setup completed successfully:', { profileId: generatedProfileId, userRole: storedRole })

      } catch (error) {
        console.error('Error setting up profile:', error)
        setProfileError(error.message)
        setIsProfileReady(false)
      }
    }

    setupProfile()
  }, [isAuthenticated, user])

  return {
    user,
    isAuthenticated,
    isLoading,
    error: error || profileError,
    profileId, // Generic profile ID (restaurant_id or pickup_id)
    restaurantId: userRole === 'business' ? profileId : null, // For backward compatibility
    pickupId: userRole === 'pickup' ? profileId : null,
    isRestaurantReady: isProfileReady, // For backward compatibility
    isProfileReady,
    profileError,
    userRole // Return the user role for routing
  }
}

// Helper function to generate a consistent profile ID from user data
const generateProfileIdFromUser = (user) => {
  // Use user's name or email as base for ID generation
  const baseString = user.name || user.email || user.sub || 'default'
  
  // Create a simple hash-like ID by converting string to a UUID-like format
  const hash = baseString.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  // Convert to a UUID-like format
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return `00000000-0000-0000-0000-0000${hex}`
}