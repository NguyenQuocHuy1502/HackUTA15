import React, { useState, useEffect } from 'react';
import './FoodLeftoverForm.css';
import { recipeService } from '../lib/supabaseService';

// --- SVG ICONS ---
const Icons = {
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>,
    RightArrow: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 ml-2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
};

// --- Waste Tracking Component ---
const WasteTracker = ({ restaurantId }) => {
    const [recipes, setRecipes] = useState([]);
    const [wasteEntries, setWasteEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch recipes from Supabase
    useEffect(() => {
        const fetchRecipes = async () => {
            if (!restaurantId) {
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching recipes for restaurant:', restaurantId);
                const result = await recipeService.getRecipesByRestaurant(restaurantId);
                
                if (result.success) {
                    console.log('Recipes fetched successfully:', result.data);
                    setRecipes(result.data);
                } else {
                    console.error('Failed to fetch recipes:', result.error);
                    setError(result.error);
                }
            } catch (err) {
                console.error('Error fetching recipes:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [restaurantId]);

    const addWasteEntry = () => {
        setWasteEntries(prev => [...prev, {
            id: Date.now(),
            recipe_id: '',
            servings_wasted: 0,
            reason: ''
        }]);
    };

    const updateWasteEntry = (id, field, value) => {
        setWasteEntries(prev => prev.map(entry => 
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    const removeWasteEntry = (id) => {
        setWasteEntries(prev => prev.filter(entry => entry.id !== id));
    };

    const totalServingsWasted = wasteEntries.reduce((total, entry) => 
        total + (parseInt(entry.servings_wasted) || 0), 0
    );

    const handleSubmitWaste = async () => {
        if (wasteEntries.length === 0) {
            alert('Please add at least one waste entry.');
            return;
        }

        const validEntries = wasteEntries.filter(entry => 
            entry.recipe_id && entry.servings_wasted > 0
        );

        if (validEntries.length === 0) {
            alert('Please fill in recipe and servings for at least one entry.');
            return;
        }

        try {
            console.log('Submitting waste data:', validEntries);
            
            // Save each waste entry to Supabase
            const wasteData = validEntries.map(entry => ({
                restaurant_id: restaurantId,
                recipe_id: entry.recipe_id,
                servings_wasted: parseInt(entry.servings_wasted),
                waste_date: new Date().toISOString().split('T')[0],
                is_claimed: false
            }));

            // Use the wasteService to save all data at once
            const { wasteService } = await import('../lib/supabaseService');
            
            const result = await wasteService.saveWasteEntries(wasteData);
            if (!result.success) {
                throw new Error(`Failed to save waste entries: ${result.error}`);
            }

            alert(`Successfully saved ${validEntries.length} waste entries!\nTotal servings wasted: ${totalServingsWasted}`);
            setWasteEntries([]);
            
        } catch (error) {
            console.error('Error saving waste data:', error);
            alert(`Failed to save waste data: ${error.message}`);
        }
    };

    if (loading) {
        return (
            <div className="waste-tracker-container">
                <div className="loading-message">
                    <div className="loading-spinner"></div>
                    <p>Loading recipes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="waste-tracker-container">
                <div className="error-message">
                    <h3>Error Loading Recipes</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    if (recipes.length === 0) {
        return (
            <div className="waste-tracker-container">
                <div className="no-recipes-message">
                    <h3>No Recipes Found</h3>
                    <p>You need to create recipes first before tracking waste.</p>
                    <p>Go to the Daily Import form to create your recipes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="waste-tracker-container">
            <div className="tracker-header">
                <h2 className="tracker-title">Food Waste Tracker</h2>
                <p className="tracker-subtitle">Track wasted servings of your recipes</p>
            </div>

            <div className="waste-entries">
                {wasteEntries.map(entry => (
                    <div key={entry.id} className="waste-entry">
                        <div className="waste-entry-content">
                            <div className="recipe-selection">
                                <label className="field-label">Recipe:</label>
                                <select
                                    value={entry.recipe_id}
                                    onChange={(e) => updateWasteEntry(entry.id, 'recipe_id', e.target.value)}
                                    className="recipe-select"
                                >
                                    <option value="">Select a recipe</option>
                                    {recipes.map(recipe => (
                                        <option key={recipe.recipe_id} value={recipe.recipe_id}>
                                            {recipe.recipe_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="servings-input">
                                <label className="field-label">Servings Wasted:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={entry.servings_wasted}
                                    onChange={(e) => updateWasteEntry(entry.id, 'servings_wasted', e.target.value)}
                                    className="servings-input-field"
                                    placeholder="Number of servings"
                                />
                            </div>

                            <div className="reason-selection">
                                <label className="field-label">Reason:</label>
                                <select
                                    value={entry.reason}
                                    onChange={(e) => updateWasteEntry(entry.id, 'reason', e.target.value)}
                                    className="reason-select"
                                >
                                    <option value="">Select reason</option>
                                    <option value="overcooked">Overcooked</option>
                                    <option value="undercooked">Undercooked</option>
                                    <option value="expired">Expired</option>
                                    <option value="spoiled">Spoiled</option>
                                    <option value="customer_return">Customer Return</option>
                                    <option value="overproduction">Overproduction</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => removeWasteEntry(entry.id)}
                            className="remove-entry-btn"
                            title="Remove this entry"
                        >
                            <Icons.Trash />
                        </button>
                    </div>
                ))}
            </div>

            <div className="waste-actions">
                <button onClick={addWasteEntry} className="add-waste-btn">
                    <Icons.Plus />
                    Add Waste Entry
                </button>
            </div>

            {wasteEntries.length > 0 && (
                <div className="total-summary">
                    <h3 className="total-title">
                        Total Servings Wasted: <span className="total-amount">{totalServingsWasted}</span>
                    </h3>
                    <button onClick={handleSubmitWaste} className="submit-waste-btn">
                        Save Waste Data
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
export default function FoodLeftoverForm({ restaurantId }) {
    return (
        <div className="food-leftover-app">
            <WasteTracker restaurantId={restaurantId} />
        </div>
    );
}
