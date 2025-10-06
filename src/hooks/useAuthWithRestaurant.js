import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { supabase } from '../lib/supabase';

export const useAuthWithRestaurant = () => {
    const { user, isAuthenticated, isLoading, error } = useAuth0();
    const [profileReady, setProfileReady] = useState(false);
    const [restaurantId, setRestaurantId] = useState(null);
    const [isPickup, setIsPickup] = useState(false);
    const [restaurantError, setRestaurantError] = useState(null);

    useEffect(() => {
        console.log('useAuthWithRestaurant useEffect triggered:', { user, isAuthenticated, isLoading });
        
        if (!isAuthenticated || !user) {
            console.log('Not authenticated or no user, setting profile ready to false');
            setProfileReady(false);
            setRestaurantId(null);
            setIsPickup(false);
            setRestaurantError(null);
            return;
        }

        const setupProfile = async () => {
            try {
                setRestaurantError(null);
                const storedRole = localStorage.getItem('selectedRole');
                console.log('Stored role from localStorage:', storedRole);
                console.log('All localStorage items:', Object.keys(localStorage).map(key => ({ key, value: localStorage.getItem(key) })));
                
                console.log('Setting up profile for user:', user);
                console.log('Role:', storedRole);
                console.log('User object details:', {
                    email: user.email,
                    name: user.name,
                    sub: user.sub
                });

                // Generate a consistent restaurant ID based on user email
                const emailHash = user.email ? 
                    user.email.split('').reduce((a, b) => {
                        a = ((a << 5) - a) + b.charCodeAt(0);
                        return a & a;
                    }, 0) : 
                    Math.random() * 1000000;
                
                const generatedId = `00000000-0000-0000-0000-${Math.abs(emailHash).toString(16).padStart(12, '0')}`;
                console.log('Generated profile ID:', generatedId);

                if (storedRole === 'pickup') {
                    console.log('🚚 PICKUP BRANCH: Creating pickup profile');
                    
                    try {
                        // Check if pickup profile already exists
                        const { data: existingPickup, error: fetchError } = await supabase
                            .from('pickups')
                            .select('*')
                            .eq('email', user.email)
                            .maybeSingle();

                        if (fetchError) {
                            console.error('Error fetching pickup profile:', fetchError);
                            if (fetchError.message.includes('does not exist') || fetchError.message.includes('relation')) {
                                console.log('Pickups table does not exist, using fallback mode');
                                // Use fallback mode - create profile in memory
                                setRestaurantId(generatedId);
                                setIsPickup(true);
                                setProfileReady(true);
                                localStorage.removeItem('selectedRole');
                                return;
                            }
                            throw fetchError;
                        }

                        if (existingPickup) {
                            console.log('Pickup already exists:', existingPickup);
                            setRestaurantId(existingPickup.pickup_id);
                            setIsPickup(true);
                            setProfileReady(true);
                            localStorage.removeItem('selectedRole');
                            return;
                        }

                        // Create pickup profile
                        const pickupData = {
                            pickup_id: generatedId,
                            email: user.email || 'no-email@example.com',
                            name: user.name || 'Pickup Organization',
                            organization_name: user.name || 'Pickup Organization',
                            phone: user.phone_number || null,
                            address: null,
                            created_at: new Date().toISOString()
                        };

                        const { data: pickupResult, error: pickupError } = await supabase
                            .from('pickups')
                            .insert([pickupData])
                            .select()
                            .single();

                        if (pickupError) {
                            console.error('Error creating pickup profile:', pickupError);
                            if (pickupError.message.includes('does not exist') || pickupError.message.includes('relation')) {
                                console.log('Pickups table does not exist, using fallback mode');
                                // Use fallback mode - create profile in memory
                                setRestaurantId(generatedId);
                                setIsPickup(true);
                                setProfileReady(true);
                                localStorage.removeItem('selectedRole');
                                return;
                            }
                            // If it's a duplicate key error, try to fetch existing
                            if (pickupError.code === '23505') {
                                const { data: existingPickup } = await supabase
                                    .from('pickups')
                                    .select('*')
                                    .eq('email', user.email)
                                    .single();
                                if (existingPickup) {
                                    setRestaurantId(existingPickup.pickup_id);
                                    setIsPickup(true);
                                    setProfileReady(true);
                                    localStorage.removeItem('selectedRole');
                                    return;
                                }
                            }
                            throw pickupError;
                        }

                        console.log('Created pickup profile:', pickupResult);
                        setRestaurantId(pickupResult.pickup_id);
                        setIsPickup(true);
                    } catch (dbError) {
                        console.error('Database error for pickup profile:', dbError);
                        if (dbError.message.includes('does not exist') || dbError.message.includes('relation')) {
                            console.log('Database tables not available, using fallback mode');
                            setRestaurantId(generatedId);
                            setIsPickup(true);
                            setProfileReady(true);
                            localStorage.removeItem('selectedRole');
                            return;
                        }
                        throw dbError;
                    }
                } else {
                    console.log('🏪 RESTAURANT BRANCH: Creating restaurant profile');
                    
                    try {
                        // Check if restaurant profile already exists
                        const { data: existingRestaurant, error: fetchError } = await supabase
                            .from('restaurants')
                            .select('*')
                            .eq('email', user.email)
                            .maybeSingle();

                        if (fetchError) {
                            console.error('Error fetching restaurant profile:', fetchError);
                            if (fetchError.message.includes('does not exist') || fetchError.message.includes('relation')) {
                                console.log('Restaurants table does not exist, using fallback mode');
                                // Use fallback mode - create profile in memory
                                setRestaurantId(generatedId);
                                setIsPickup(false);
                                setProfileReady(true);
                                localStorage.removeItem('selectedRole');
                                return;
                            }
                            throw fetchError;
                        }

                        if (existingRestaurant) {
                            console.log('Restaurant already exists:', existingRestaurant);
                            setRestaurantId(existingRestaurant.restaurant_id);
                            setIsPickup(false);
                            setProfileReady(true);
                            localStorage.removeItem('selectedRole');
                            return;
                        }

                        // Create restaurant profile
                        const restaurantData = {
                            restaurant_id: generatedId,
                            email: user.email || 'no-email@example.com',
                            name: user.name || 'Restaurant',
                            phone: user.phone_number || null,
                            address: null,
                            created_at: new Date().toISOString()
                        };

                        const { data: restaurantResult, error: restaurantError } = await supabase
                            .from('restaurants')
                            .insert([restaurantData])
                            .select()
                            .single();

                        if (restaurantError) {
                            console.error('Error creating restaurant profile:', restaurantError);
                            if (restaurantError.message.includes('does not exist') || restaurantError.message.includes('relation')) {
                                console.log('Restaurants table does not exist, using fallback mode');
                                // Use fallback mode - create profile in memory
                                setRestaurantId(generatedId);
                                setIsPickup(false);
                                setProfileReady(true);
                                localStorage.removeItem('selectedRole');
                                return;
                            }
                            // If it's a duplicate key error, try to fetch existing
                            if (restaurantError.code === '23505') {
                                const { data: existingRestaurant } = await supabase
                                    .from('restaurants')
                                    .select('*')
                                    .eq('email', user.email)
                                    .single();
                                if (existingRestaurant) {
                                    setRestaurantId(existingRestaurant.restaurant_id);
                                    setIsPickup(false);
                                    setProfileReady(true);
                                    localStorage.removeItem('selectedRole');
                                    return;
                                }
                            }
                            throw restaurantError;
                        }

                        console.log('Created restaurant profile:', restaurantResult);
                        setRestaurantId(restaurantResult.restaurant_id);
                        setIsPickup(false);
                    } catch (dbError) {
                        console.error('Database error for restaurant profile:', dbError);
                        if (dbError.message.includes('does not exist') || dbError.message.includes('relation')) {
                            console.log('Database tables not available, using fallback mode');
                            setRestaurantId(generatedId);
                            setIsPickup(false);
                            setProfileReady(true);
                            localStorage.removeItem('selectedRole');
                            return;
                        }
                        throw dbError;
                    }
                }

                setProfileReady(true);
                localStorage.removeItem('selectedRole');
                
            } catch (error) {
                console.error('Error setting up profile:', error);
                setRestaurantError(error.message);
                setProfileReady(false);
            }
        };

        setupProfile();
    }, [user, isAuthenticated, isLoading]);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        profileReady,
        restaurantId,
        isPickup,
        restaurantError,
        isRestaurantReady: profileReady,
        userRole: isPickup ? 'pickup' : 'business'
    };
};
