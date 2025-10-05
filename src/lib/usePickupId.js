import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { pickupService } from './supabaseService';

export const usePickupId = () => {
  const { user, isAuthenticated, isLoading, error: authError } = useAuth0();
  const [pickupId, setPickupId] = useState(null);
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    console.log('[DEBUG] usePickupId effect triggered');
    console.log('[DEBUG] Auth status:', { isAuthenticated, isLoading, user });

    const fetchPickupProfile = async () => {
      if (!isAuthenticated || isLoading || !user) {
        console.log('[DEBUG] Not authenticated or user not loaded yet');
        setIsProfileReady(false);
        setPickupId(null);
        return;
      }

      setIsProfileReady(false);
      setProfileError(null);

      try {
        // Generate pickup_id from user
        const pickupIdGenerated = generateProfileIdFromUser(user);
        console.log('[DEBUG] Generated pickup_id:', pickupIdGenerated);

        // Try fetching existing pickup profile
        const existingPickup = await pickupService.getPickupById(pickupIdGenerated);

        if (existingPickup.success) {
          console.log('[DEBUG] Pickup profile found:', existingPickup.data);
          setPickupId(existingPickup.data.pickup_id);
          setIsProfileReady(true);
        } else {
          console.log('[DEBUG] Pickup profile not found, creating new one');
          const createResult = await pickupService.createPickupProfile({
            pickup_id: pickupIdGenerated,
            pickup_name: user.name || user.nickname || 'Pickup Organization',
            contact_person: user.name || user.nickname,
            phone_number: 'Phone not provided',
            email: user.email || user.sub
          });

          if (createResult.success) {
            console.log('[DEBUG] Pickup profile created successfully:', createResult.data);
            setPickupId(createResult.data.pickup_id);
            setIsProfileReady(true);
          } else {
            console.error('[DEBUG] Failed to create pickup profile:', createResult.error);
            setProfileError(createResult.error);
            setIsProfileReady(false);
          }
        }
      } catch (err) {
        console.error('[DEBUG] Exception while fetching/creating pickup profile:', err);
        setProfileError(err.message);
        setIsProfileReady(false);
      }
    };

    fetchPickupProfile();
  }, [isAuthenticated, isLoading, user]);

  console.log('[DEBUG] Hook return values:', { isAuthenticated, isAuthLoading: isLoading, authError: authError || profileError, pickupId, isProfileReady });

  return {
    isAuthenticated,
    isAuthLoading: isLoading,
    authError: authError || profileError,
    pickupId,
    isProfileReady
  };
};

// Helper function to generate a consistent pickup_id from user data
const generateProfileIdFromUser = (user) => {
  const baseString = user.name || user.email || user.sub || 'default';
  const hash = baseString.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `00000000-0000-0000-0000-0000${hex}`;
};
