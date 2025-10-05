import React, { useState, useMemo, useEffect } from 'react';
import './PickUpPage.css';
import { pickupService, orderService } from '../lib/supabaseService';
import { usePickupId } from '../lib/usePickupId';
import { supabase } from '../lib/supabase';

// Icon components
const Icons = {
    Search: () => (
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    Filter: () => (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
    ),
    Location: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Star: () => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    ),
    ShoppingCart: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
    ),
    Close: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    )
};

// Hero component
const Hero = () => (
    <div className="hero-section">
        <h1 className="text-4xl font-bold mb-4">Rescue Food, Reduce Waste</h1>
        <p className="text-xl mb-6">Connect with local restaurants to rescue surplus food and help feed your community</p>
        <div className="flex justify-center gap-8 text-lg">
            <div>
                <div className="text-3xl font-bold text-green-400">500+</div>
                <div>Restaurants</div>
            </div>
            <div>
                <div className="text-3xl font-bold text-green-400">2,000+</div>
                <div>Meals Rescued</div>
            </div>
            <div>
                <div className="text-3xl font-bold text-green-400">15</div>
                <div>Cities</div>
            </div>
        </div>
    </div>
);


// Restaurant Card component
const RestaurantCard = ({ restaurant, onAddToCart, orders }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div className="restaurant-card">
            <div className="restaurant-header">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="restaurant-name">{restaurant.name}</h3>
                        <div className="restaurant-info">
                            <Icons.Location />
                            <span>{restaurant.distance}</span>
                            <Icons.Star />
                            <span>{restaurant.rating}</span>
                            <span>• {restaurant.totalWaste} servings available</span>
                    </div>
                        </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <svg 
                            className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        </button>
                    </div>
                </div>
            {isExpanded && (
                <div className="food-items">
                    {restaurant.items.map(item => (
                        <div key={item.id} className="food-item">
                            <div className="food-details">
                                <div className="food-name">{item.name}</div>
                                <div className="food-meta">
                                    {item.amount} {item.unit} • {item.category} • Expires {item.expiry}
            </div>
                                    </div>
                            <button
                                className="add-btn"
                                onClick={() => onAddToCart(restaurant.id, item)}
                                disabled={orders[item.id]}
                            >
                                {orders[item.id] ? 'Added' : 'Add'}
                            </button>
                                    </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Checkout Modal component
const CheckoutModal = ({ isOpen, onClose, cart, restaurants, onRemoveItem, onConfirm }) => {
    if (!isOpen) return null;

    const cartSummary = Object.values(cart).reduce((acc, items) => acc + items.length, 0);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Pickup Request ({cartSummary} items)</h2>
                    <button className="close-btn" onClick={onClose}>
                        <Icons.Close />
                    </button>
                </div>
                <div className="modal-body">
                    {Object.entries(cart).map(([restaurantId, items]) => {
                        const restaurant = restaurants.find(r => r.id === parseInt(restaurantId));
    return (
                            <div key={restaurantId}>
                                <h3 className="restaurant-name-modal">{restaurant?.name}</h3>
                                {items.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="cart-item">
                                        <div className="cart-item-details">
                                            <div className="cart-item-name">{item.name}</div>
                                            <div className="cart-item-meta">
                                                {item.amount} {item.unit} • Expires {item.expiry}
                                            </div>
                        </div>
                                        <button
                                            className="remove-btn"
                                            onClick={() => onRemoveItem(restaurantId, item.id)}
                                        >
                                            Remove
                                        </button>
                                                </div>
                                            ))}
                                        </div>
                        );
                    })}
                                    </div>
                <div className="modal-footer">
                    <button className="confirm-btn" onClick={onConfirm}>
                        Confirm Pickup Request
                            </button>
                        </div>
            </div>
        </div>
    );
};

// Main PickUpPage component
const PickUpPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState({});
    const [confirmedOrders, setConfirmedOrders] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { pickupId, isProfileReady } = usePickupId();
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const [filters, setFilters] = useState({
        searchTerm: '',
        distance: 'all',
        foodType: 'all',
        minWaste: 0
    });

    

    // Fetch restaurants with waste data from Supabase
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setLoading(true);
                const result = await pickupService.getRestaurantsWithWaste();
                
                if (result.success) {
                    // Transform Supabase data to match our component structure
                    const transformedRestaurants = result.data.map(restaurant => ({
                        id: restaurant.restaurant_id,
                        name: restaurant.restaurant_name,
                        distance: `${(Math.random() * 5 + 0.5).toFixed(1)} miles`, // Mock distance for now
                        rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Mock rating for now
                        totalWaste: restaurant.waste.reduce((sum, waste) => sum + waste.servings_wasted, 0),
                        items: restaurant.waste.map(waste => ({
                            id: waste.waste_id,
                            name: waste.recipes?.recipe_name || 'Unknown Recipe',
                            category: waste.recipes?.category || 'Other',
                            amount: waste.servings_wasted,
                            unit: 'servings',
                            expiry: waste.waste_date === new Date().toISOString().split('T')[0] ? 'Today' : 'Tomorrow'
                        }))
                    }));
                    
                    setRestaurants(transformedRestaurants);
                } else {
                    setError(result.error);
                }
            } catch (err) {
                console.error('Error fetching restaurants:', err);
                setError('Failed to load restaurants');
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const cartItemIds = useMemo(() => {
  const ids = {};
  Object.values(cart).flat().forEach(item => {
    ids[item.id] = true;
  });
  return ids;
}, [cart]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ 
            ...prev, 
            [name]: name === 'minWaste' ? parseInt(value) : value 
        }));
    };

    const filteredRestaurants = useMemo(() => {
        return restaurants.filter(restaurant => {
            const matchesSearch = !filters.searchTerm || 
                restaurant.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                restaurant.items.some(item => 
                    item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                    item.category.toLowerCase().includes(filters.searchTerm.toLowerCase())
                );
            
            const matchesDistance = filters.distance === 'all' || 
                parseFloat(restaurant.distance.replace(' miles', '')) <= parseFloat(filters.distance);
            
            const matchesFoodType = filters.foodType === 'all' ||
                restaurant.items.some(item => item.category === filters.foodType);
            
            const matchesMinWaste = restaurant.totalWaste >= filters.minWaste;
            
            return matchesSearch && matchesDistance && matchesFoodType && matchesMinWaste;
        });
    }, [restaurants, filters]);

    const cartSummary = Object.values(cart).reduce((acc, items) => acc + items.length, 0);

    const handleAddToCart = (restaurantId, item) => {
        setCart(prev => ({
            ...prev,
            [restaurantId]: [...(prev[restaurantId] || []), item]
        }));
    };

    const handleRemoveFromCart = (restaurantId, itemId) => {
        setCart(prev => ({
            ...prev,
            [restaurantId]: prev[restaurantId]?.filter(item => item.id !== itemId) || []
        }));
    };

const handleConfirmPickup = async () => {
  if (!pickupId || !isProfileReady) {
    alert('Pickup profile not ready. Please log in again.');
    return;
  }

  try {
    for (const [restaurantId, items] of Object.entries(cart)) {
      // Insert order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          pickup_id: pickupId,
          restaurant_id: restaurantId,
          status: 'pending',
        })
        .select('order_id')
        .single();

      if (orderError) throw orderError;
      const orderId = orderData.order_id;

      // Insert order items (link to waste entries)
      const orderItems = items.map(item => ({
        order_id: orderId,
        waste_id: item.id,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
    }

    // Mark items as confirmed
    const newConfirmedOrders = { ...confirmedOrders };
    Object.values(cart).flat().forEach(item => {
      newConfirmedOrders[item.id] = true;
    });
    setConfirmedOrders(newConfirmedOrders);

    // Clear cart and close modal
    setCart({});
    setIsModalOpen(false);

    alert('Pickup request submitted successfully!');
  } catch (err) {
    console.error('Error confirming pickup:', err);
    alert(`Failed to submit order: ${err.message}`);
  }
};


    return (
        <div className="pickup-page-container">
            {/* Header */}
            <header className="pickup-header">
                <div className="header-content">
                    <div className="header-main">
                        <div className="header-brand">
                            <h1 className="brand-title">Feco</h1>
                            <p className="brand-subtitle">Find surplus food from local restaurants</p>
                        </div>
                        
                    </div>
                </div>
                </header>

            {/* Main Content */}
            <div className="main-content">

                {/* Hero Section */}
                <Hero />

                {/* Search and Filters */}
                <div className="search-filters-section">
                    <div className="search-bar-container">
                        <div className="search-input-wrapper">
                            <input
                                name="searchTerm"
                                value={filters.searchTerm}
                                onChange={handleFilterChange}
                                type="text"
                                placeholder="Search for restaurants, food types, or locations..."
                                className="search-input"
                            />
                            <Icons.Search />
                        </div>
                        <button
                            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                            className="filters-btn"
                        >
                            <Icons.Filter /> Filters
                        </button>
                    </div>

                    {isFiltersVisible && (
                        <div className="filters-panel">
                            <div className="filters-grid">
                                <div className="filter-group">
                                    <label htmlFor="distance-filter" className="filter-label">
                                        Distance
                                    </label>
                                    <select
                                        id="distance-filter"
                                        name="distance"
                                        value={filters.distance}
                                        onChange={handleFilterChange}
                                        className="filter-select"
                                    >
                                        <option value="all">Any</option>
                                        <option value="5">&lt; 5 miles</option>
                                        <option value="10">&lt; 10 miles</option>
                                        <option value="20">&lt; 20 miles</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label htmlFor="food-type-filter" className="filter-label">
                                        Food Type
                                    </label>
                                    <select
                                        id="food-type-filter"
                                        name="foodType"
                                        value={filters.foodType}
                                        onChange={handleFilterChange}
                                        className="filter-select"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="Produce">Produce</option>
                                        <option value="Dairy">Dairy</option>
                                        <option value="Bakery">Bakery</option>
                                        <option value="Meat">Meat</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label htmlFor="waste-amount-filter" className="filter-label">
                                        Minimum Waste (servings)
                                    </label>
                                    <input
                                        type="range"
                                        id="waste-amount-filter"
                                        name="minWaste"
                                        value={filters.minWaste}
                                        onChange={handleFilterChange}
                                        min="0"
                                        max="500"
                                        className="filter-range"
                                    />
                                    <span className="filter-value">{filters.minWaste} servings</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Restaurant Listings */}
                <div className="restaurant-listings">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading restaurants...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>Error: {error}</p>
                            <button onClick={() => window.location.reload()} className="retry-btn">
                                Retry
                            </button>
                        </div>
                    ) : filteredRestaurants.length > 0 ? (
                        filteredRestaurants.map(restaurant => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                onAddToCart={handleAddToCart}
                                orders={cartItemIds}
                            />
                        ))
                    ) : (
                        <p className="no-results">No restaurants match your criteria.</p>
                    )}
                </div>

                {cartSummary > 0 && (
  <div className="fixed bottom-6 right-6 z-50">
<button
  onClick={() => setIsModalOpen(true)}
  style={{ backgroundColor: '#22c55e' }}
  className="
       fixed 
    bottom-6 
    left-6 
    z-50
    text-white 
    font-bold 
    text-xl 
    px-6 
    py-4 
    rounded-2xl 
    shadow-2xl 
    flex 
    items-center 
    gap-2
    transition 
    transform 
    hover:scale-110 
    hover:shadow-xl
    hover:bg-green-600
    focus:outline-none
    focus:ring-4
    focus:ring-green-300
  "
>
  Checkout ({cartSummary})
</button>
  </div>
)}

            
                {/* Checkout Modal */}
            <CheckoutModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cart={cart}
                restaurants={restaurants}
                onRemoveItem={handleRemoveFromCart}
                onConfirm={handleConfirmPickup}
            />
            </div>
        </div>
    );
};

export default PickUpPage;