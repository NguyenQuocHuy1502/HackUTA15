import React, { useState, useMemo, useEffect, useRef } from 'react';
import './FoodWasteForm.css';
import { dailyImportService, recipeService } from '../lib/supabaseService';

// --- SVG ICONS ---
const Icons = {
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>,
    RightArrow: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 ml-2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
};

// --- MASTER INGREDIENT LIST FOR AUTO-SUGGEST ---
const MASTER_INGREDIENT_LIST = [
    'Alfredo Sauce', 'All-Purpose Flour', 'Almonds', 'Apples', 'Apple Cider Vinegar', 'Arugula', 'Asparagus', 'Avocados',
    'Bacon', 'Baguette', 'Balsamic Vinegar', 'Bananas', 'Basil', 'BBQ Sauce', 'Beef Broth', 'Beets', 'Bell Peppers',
    'Black Beans', 'Black Pepper', 'Blue Cheese', 'Blueberries', 'Bread (Sourdough)', 'Brie', 'Brisket', 'Brioche',
    'Broccoli', 'Brown Sugar', 'Butter (Salted)', 'Butter (Unsalted)', 'Butter Lettuce', 'Buttermilk', 'Cabbage',
    'Caesar Dressing', 'Canola Oil', 'Carrots', 'Cauliflower', 'Cayenne Pepper', 'Cheddar Cheese', 'Chicken Breast',
    'Chicken Broth', 'Chicken Thigh', 'Chicken Wings', 'Chickpeas', 'Chili Powder', 'Chives', 'Chuck Roast', 'Ciabatta',
    'Cilantro', 'Cinnamon', 'Clams', 'Cod', 'Corn', 'Corn Tortillas', 'Crab', 'Crème Fraîche', 'Cucumbers', 'Cumin',
    'Dill', 'Dinner Rolls', 'Dried Basil', 'Dried Oregano', 'Duck', 'Eggs', 'Eggplant', 'Feta Cheese', 'Flour Tortillas',
    'Garlic', 'Garlic Powder', 'Ghee', 'Ginger', 'Goat Cheese', 'Granulated Sugar', 'Grapes', 'Green Beans', 'Greek Yogurt',
    'Ground beef', 'Ground Lamb', 'Half-and-Half', 'Ham', 'Hamburger Buns', 'Heavy Cream', 'Honey', 'Hot Sauce',
    'Iceberg Lettuce', 'Jalapeño Peppers', 'Kale', 'Ketchup', 'Kosher Salt', 'Lamb Chops', 'Leeks', 'Leg of Lamb',
    'Lemons', 'Lentils', 'Limes', 'Lobster', 'Maple Syrup', 'Marinara Sauce', 'Mayonnaise', 'Melons', 'Mint',
    'Mozzarella Cheese', 'Mushrooms', 'Mussels', 'Mustard', 'Nutmeg', 'Oats', 'Olive Oil', 'Onions (Red)',
    'Onions (Yellow)', 'Onion Powder', 'Oranges', 'Oregano', 'Oysters', 'Paprika', 'Parmesan Cheese', 'Parsley',
    'Pasta (Fettuccine)', 'Pasta (Penne)', 'Pasta (Spaghetti)', 'Peanuts', 'Pesto', 'Pie Crusts', 'Pineapple',
    'Pizza Dough', 'Plain Yogurt', 'Pork Belly', 'Pork Chops', 'Pork Loin', 'Potatoes (Red)', 'Potatoes (Russet)',
    'Prosciutto', 'Provolone Cheese', 'Puff Pastry', 'Pulled Pork', 'Quail', 'Quinoa', 'Radishes', 'Ranch Dressing',
    'Raspberries', 'Red Pepper Flakes', 'Red Wine Vinegar', 'Ribs', 'Rice', 'Ricotta', 'Romaine Lettuce', 'Rosemary',
    'Salmon', 'Salsa', 'Sausage', 'Scallops', 'Sesame Seeds', 'Short Ribs', 'Shrimp', 'Skim Milk', 'Sour Cream',
    'Soy Sauce', 'Spinach', 'Spring Mix', 'Squash', 'Sriracha', 'Steak (Filet Mignon)', 'Steak (Ribeye)',
    'Steak (Sirloin)', 'Strawberries', 'Sweet Potatoes', 'Swiss Chard', 'Swiss Cheese', 'Teriyaki Sauce', 'Thyme',
    'Tilapia', 'Tomatoes (Beefsteak)', 'Tomatoes (Cherry)', 'Tomatoes (Roma)', 'Tomato Paste', 'Tuna', 'Turkey',
    'Turmeric', 'Veal', 'Vegetable Broth', 'Vinaigrette', 'Walnuts', 'Whole Chicken', 'Whole Milk', 'Zucchini'
].sort();


// --- Recipe Onboarding Component ---
const RecipeOnboarding = ({ onRecipesAdded, restaurantId }) => {
    const [recipeName, setRecipeName] = useState('');
    const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
    const [createdRecipes, setCreatedRecipes] = useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = value;
        setIngredients(newIngredients);
    };

    const addIngredientField = () => {
        setIngredients([...ingredients, { name: '', amount: '' }]);
    };

    const removeIngredientField = (index) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients);
    };

    const handleSaveRecipe = async (e) => {
        e.preventDefault();
        if (recipeName && ingredients.every(ing => ing.name && ing.amount)) {
            const newRecipe = {
                name: recipeName,
                ingredients: ingredients.map(ing => ({ ...ing, amount: parseFloat(ing.amount) }))
            };
            
            // Save recipe to Supabase if restaurantId is available
            if (restaurantId) {
                try {
                    console.log('Saving recipe to Supabase:', newRecipe);
                    const result = await recipeService.saveRecipeWithIngredients(restaurantId, newRecipe);
                    
                    if (result.success) {
                        console.log('Recipe saved successfully:', result.data);
                        // Add Supabase recipe ID to the local recipe
                        newRecipe.supabaseId = result.data.recipe_id;
                        newRecipe.ingredientsCount = result.data.ingredients_count;
                    } else {
                        console.error('Failed to save recipe to Supabase:', result.error);
                        // Still add to local state even if Supabase fails
                    }
                } catch (error) {
                    console.error('Error saving recipe to Supabase:', error);
                    // Still add to local state even if Supabase fails
                }
            }
            
            setCreatedRecipes(prev => [...prev, newRecipe]);
            setRecipeName('');
            setIngredients([{ name: '', amount: '' }]);
        } else {
            alert('Please fill out the recipe name and all ingredient fields.');
        }
    };

    const handleCsvImport = async () => {
        alert("CSV import functionality would be handled here. For now, we'll add sample recipes.");
        const sampleRecipes = [
            { name: 'Classic Burger', ingredients: [{ name: 'Ground beef', amount: 0.5 }, { name: 'Hamburger Buns', amount: 0.2 }, { name: 'Iceberg Lettuce', amount: 0.1 }] },
            { name: 'Cheese Pizza', ingredients: [{ name: 'Pizza Dough', amount: 1 }, { name: 'Mozzarella Cheese', amount: 0.5 }, { name: 'Tomatoes (Roma)', amount: 0.4 }] },
        ];
        
        // Save sample recipes to Supabase if restaurantId is available
        if (restaurantId) {
            try {
                console.log('Saving sample recipes to Supabase...');
                for (const recipe of sampleRecipes) {
                    const result = await recipeService.saveRecipeWithIngredients(restaurantId, recipe);
                    if (result.success) {
                        console.log(`Sample recipe "${recipe.name}" saved successfully`);
                        recipe.supabaseId = result.data.recipe_id;
                        recipe.ingredientsCount = result.data.ingredients_count;
                    } else {
                        console.error(`Failed to save sample recipe "${recipe.name}":`, result.error);
                    }
                }
            } catch (error) {
                console.error('Error saving sample recipes to Supabase:', error);
            }
        }
        
        onRecipesAdded(sampleRecipes);
    };

    const handleDownloadCsvTemplate = () => {
        const headers = "recipe_name,ingredient_name,amount_lbs";
        const example1 = "Spaghetti Bolognese,Ground Beef,2";
        const example2 = "Spaghetti Bolognese,Pasta,1.5";
        const example3 = "Caesar Salad,Lettuce,3";
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${example1}\n${example2}\n${example3}`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "recipe_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredSuggestions = useMemo(() => {
        if (activeSuggestionIndex === -1 || !ingredients[activeSuggestionIndex]?.name) return [];
        const currentInput = ingredients[activeSuggestionIndex].name.toLowerCase();
        return MASTER_INGREDIENT_LIST.filter(ing => ing.toLowerCase().includes(currentInput));
    }, [ingredients, activeSuggestionIndex]);


    return (
        <div className = "card">
            <div className="food-waste-form-container">
                <div className="form-header">
                    <h2 className="form-title">Welcome to Feco Food Tracker</h2>
                    <p className="form-subtitle">To get started, please add your menu recipes.</p>
                </div>

                <div className="form-content-grid">
                    {/* Manual Add Form */}
                    <div className="form-card">
                        <div className="card-header">
                            <Icons.Edit />
                            <h3 className="card-title">Add Recipes by Hand</h3>
                        </div>
                        <form onSubmit={handleSaveRecipe} className="recipe-form">
                            <div className="form-group">
                                <label className="form-label">Recipe Name</label>
                                <input
                                    type="text"
                                    value={recipeName}
                                    onChange={(e) => setRecipeName(e.target.value)}
                                    placeholder="e.g., Spaghetti Bolognese"
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ingredients</label>
                                {ingredients.map((ing, index) => (
                                    <div key={index} className="ingredient-row">
                                        <div className="ingredient-inputs">
                                            <input
                                                type="text"
                                                value={ing.name}
                                                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                                onFocus={() => setActiveSuggestionIndex(index)}
                                                onBlur={() => setTimeout(() => setActiveSuggestionIndex(-1), 150)}
                                                placeholder="Ingredient Name"
                                                className="ingredient-name-input"
                                                required
                                            />
                                            <input
                                                type="number"
                                                value={ing.amount}
                                                onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                                                placeholder="lbs"
                                                min="0"
                                                step="0.01"
                                                className="ingredient-amount-input"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeIngredientField(index)}
                                                className="remove-ingredient-btn"
                                            >
                                                <Icons.Trash />
                                            </button>
                                        </div>
                                        {activeSuggestionIndex === index && filteredSuggestions.length > 0 && (
                                            <ul className="suggestions-dropdown">
                                                {filteredSuggestions.map(suggestion => (
                                                    <li
                                                        key={suggestion}
                                                        onMouseDown={() => {
                                                            handleIngredientChange(index, 'name', suggestion);
                                                            setActiveSuggestionIndex(-1);
                                                        }}
                                                        className="suggestion-item"
                                                    >
                                                        {suggestion}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addIngredientField}
                                    className="add-ingredient-btn"
                                >
                                    <Icons.Plus />Add Ingredient
                                </button>
                            </div>
                            <button type="submit" className="save-recipe-btn">Save Recipe</button>
                        </form>
                    </div>

                    {/* Right Panel */}
                    <div className="right-panel">
                        {/* CSV Import */}
                        <div className="import-card">
                            <div className="card-header">
                                <Icons.Upload />
                                <h3 className="card-title">Import Recipes</h3>
                            </div>
                            <p className="import-description">Upload a CSV file to add multiple recipes at once.</p>
                            <div className="import-buttons">
                                <button
                                    onClick={handleDownloadCsvTemplate}
                                    className="template-btn"
                                >
                                    <Icons.Download /> Template
                                </button>
                                <button
                                    onClick={handleCsvImport}
                                    className="import-btn"
                                >
                                    Import CSV
                                </button>
                            </div>
                        </div>

                        {/* Created Recipes List */}
                        {createdRecipes.length > 0 && (
                            <div className="recipes-card">
                                <h3 className="card-title">Added Recipes</h3>
                                <ul className="recipes-list">
                                    {createdRecipes.map((recipe, index) => (
                                        <li key={index} className="recipe-item">
                                            {recipe.name}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => onRecipesAdded(createdRecipes)}
                                    className="finish-btn"
                                >
                                    Finish & Start Importing <Icons.RightArrow />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Add Item Component (with suggestion logic) ---
const AddItemWithSuggest = ({ category, onAddItem }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestionsVisible, setSuggestionsVisible] = useState(false);

    const filteredSuggestions = useMemo(() => {
        if (!inputValue) return [];
        return MASTER_INGREDIENT_LIST.filter(ing => ing.toLowerCase().includes(inputValue.toLowerCase()));
    }, [inputValue]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onAddItem(category, inputValue.trim());
            setInputValue('');
        }
    };

    const handleSuggestionClick = (suggestion) => {
        onAddItem(category, suggestion);
        setInputValue('');
    };

    return (
        <div className="add-item-container">
            <form onSubmit={handleFormSubmit}>
                <div className="add-item-inputs">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => setSuggestionsVisible(true)}
                        onBlur={() => setTimeout(() => setSuggestionsVisible(false), 150)}
                        className="add-item-input"
                        placeholder="Add food item..."
                    />
                    <button type="submit" className="add-item-btn">
                        <Icons.Plus />
                    </button>
                </div>
            </form>
            {suggestionsVisible && inputValue && filteredSuggestions.length > 0 && (
                <ul className="add-item-suggestions">
                    {filteredSuggestions.map(suggestion => (
                        <li
                            key={suggestion}
                            onMouseDown={() => handleSuggestionClick(suggestion)}
                            className="add-item-suggestion"
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// --- Import Tracking Component ---
const ImportTracker = ({ recipes, restaurantId }) => {
    const CATEGORIES = ['Meat', 'Dairy', 'Greens', 'Carbonhydrates'];
    const [importData, setImportData] = useState({});

    const handleAddItem = (category, itemName) => {
        setImportData(prev => ({
            ...prev,
            [category]: { ...prev[category], [itemName]: 0 }
        }));
    };

    const handleRemoveItem = (category, itemName) => {
    setImportData(prev => {
        const newCategoryItems = { ...prev[category] };
        delete newCategoryItems[itemName];
        return {
            ...prev,
            [category]: newCategoryItems
        };
    });
};


    const handleImportChange = (category, item, value) => {
        const amount = parseFloat(value) || 0;
        setImportData(prev => ({
            ...prev,
            [category]: { ...prev[category], [item]: amount }
        }));
    };

    const totalImports = useMemo(() => {
        return Object.values(importData).reduce((total, categoryItems) => {
            return total + Object.values(categoryItems).reduce((catTotal, amount) => catTotal + amount, 0);
        }, 0);
    }, [importData]);

    const handleSubmitDailyImport = async () => {
        const submissionData = {
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            recipes: recipes,
            importData: importData,
            totalImports: totalImports,
            categories: CATEGORIES
        };
        
        console.log('Daily Import Data Submitted:', submissionData);
        
        try {
            // Use the restaurant ID from Auth0 authentication
            const actualRestaurantId = restaurantId || '00000000-0000-0000-0000-000000000000'; // Fallback to placeholder
            
            const result = await dailyImportService.saveDailyImport(actualRestaurantId, submissionData);
            
            if (result.success) {
                const sourceMessage = result.source === 'supabase' 
                    ? 'Daily import data saved to Supabase!' 
                    : 'Daily import data saved locally (Supabase unavailable)';
                
                alert(`${sourceMessage}\nTotal: ${totalImports.toFixed(2)} lbs\nItems: ${Object.keys(importData).length} categories\nDate: ${submissionData.date}`);
                setImportData({});
            } else {
                alert(`Failed to save data: ${result.error}`);
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Failed to save data. Please check your internet connection.');
        }
    };

    const handleExportCSV = () => {
        const submissionData = {
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            recipes: recipes,
            importData: importData,
            totalImports: totalImports,
            categories: CATEGORIES
        };
        
        // Convert to CSV format
        let csvContent = "Date,Category,Item,Amount (lbs)\n";
        
        Object.entries(submissionData.importData).forEach(([category, items]) => {
            Object.entries(items).forEach(([item, amount]) => {
                csvContent += `${submissionData.date},"${category}","${item}",${amount}\n`;
            });
        });
        
        // Add summary row
        csvContent += `${submissionData.date},"TOTAL","All Items",${submissionData.totalImports}\n`;
        
        // Create and download CSV file
        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = `daily-import-${submissionData.date}.csv`;
        document.body.appendChild(csvLink);
        csvLink.click();
        document.body.removeChild(csvLink);
        
        URL.revokeObjectURL(csvUrl);
        
        alert(`CSV file downloaded!\nFile: daily-import-${submissionData.date}.csv`);
    };

    return (
        <div className="import-tracker-container">
            <div className="tracker-header">
                <h2 className="tracker-title">Daily Food Import Tracker</h2>
            </div>
            <div className="categories-grid">
                {CATEGORIES.map(category => (
                    <div key={category} className="category-card">
                        <h3 className="category-title">{category}</h3>
                        <div className="items-list">
                            {importData[category] && Object.keys(importData[category]).map(item => (
                                <div key={item} className="item-row">
                                    <label className="item-label">{item}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={importData[category][item]}
                                        onChange={(e) => handleImportChange(category, item, e.target.value)}
                                        className="item-amount-input"
                                        placeholder="lbs"
                                    />
                                            <button
            type="button"
            onClick={() => handleRemoveItem(category, item)}
            className="remove-item-btn"
        >
            <Icons.Trash />
        </button>
                                </div>
                            ))}
                        </div>
                        <AddItemWithSuggest category={category} onAddItem={handleAddItem} />
                    </div>
                ))}
            </div>
            <div className="total-summary">
                <h3 className="total-title">
                    Total Daily Imports: <span className="total-amount">{totalImports.toFixed(2)} lbs</span>
                </h3>
                <div className="export-buttons">
                    <button onClick={handleSubmitDailyImport} className="submit-daily-import-btn">
                        Save to Supabase
                    </button>
                    <button onClick={handleExportCSV} className="export-csv-btn">
                        Export as CSV
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
export default function EcoEatsTrackerApp({ restaurantId }) {
    const [recipes, setRecipes] = useState([]);
    const handleRecipesAdded = (newRecipes) => { setRecipes(prev => [...prev, ...newRecipes]); };
    return (
        <div className="food-tracker-app">
            {recipes.length === 0 ? (
                <RecipeOnboarding onRecipesAdded={handleRecipesAdded} restaurantId={restaurantId} />
            ) : (
                <ImportTracker recipes={recipes} restaurantId={restaurantId} />
            )}
        </div>
    );
};

