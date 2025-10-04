import React, { useState, useMemo, useEffect, useRef } from 'react';

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
const RecipeOnboarding = ({ onRecipesAdded }) => {
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

    const handleSaveRecipe = (e) => {
        e.preventDefault();
        if (recipeName && ingredients.every(ing => ing.name && ing.amount)) {
            const newRecipe = {
                name: recipeName,
                ingredients: ingredients.map(ing => ({ ...ing, amount: parseFloat(ing.amount) }))
            };
            setCreatedRecipes(prev => [...prev, newRecipe]);
            setRecipeName('');
            setIngredients([{ name: '', amount: '' }]);
        } else {
            alert('Please fill out the recipe name and all ingredient fields.');
        }
    };
    
    const handleCsvImport = () => {
        alert("CSV import functionality would be handled here. For now, we'll add sample recipes.");
        const sampleRecipes = [
            { name: 'Classic Burger', ingredients: [{ name: 'Beef Patty', amount: 0.5 }, { name: 'Bun', amount: 0.2 }, { name: 'Lettuce', amount: 0.1 }] },
            { name: 'Cheese Pizza', ingredients: [{ name: 'Dough', amount: 1 }, { name: 'Cheese', amount: 0.5 }, { name: 'Tomato Sauce', amount: 0.4 }] },
        ];
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
        <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center text-gray-800">Welcome to EcoEats Tracker</h2>
            <p className="text-center text-gray-500 mt-2 mb-8">To get started, please add your menu recipes.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Manual Add Form */}
                <div className="border p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                        <Icons.Edit/>
                        <h3 className="text-xl font-semibold text-gray-700">Add Recipes by Hand</h3>
                    </div>
                    <form onSubmit={handleSaveRecipe} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Recipe Name</label>
                            <input type="text" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} placeholder="e.g., Spaghetti Bolognese" className="w-full p-2 mt-1 border rounded-md focus:ring-green-500 focus:border-green-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Ingredients</label>
                            {ingredients.map((ing, index) => (
                                <div key={index} className="relative">
                                    <div className="flex items-center gap-2 mt-2">
                                        <input type="text" value={ing.name} 
                                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} 
                                            onFocus={() => setActiveSuggestionIndex(index)}
                                            onBlur={() => setTimeout(() => setActiveSuggestionIndex(-1), 150)} // delay to allow click
                                            placeholder="Ingredient Name" className="w-1/2 p-2 border rounded-md" required />
                                        <input type="number" value={ing.amount} onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)} placeholder="lbs" min="0" step="0.01" className="w-1/3 p-2 border rounded-md" required />
                                        <button type="button" onClick={() => removeIngredientField(index)} className="text-red-500 hover:text-red-700 p-2"><Icons.Trash /></button>
                                    </div>
                                    {activeSuggestionIndex === index && filteredSuggestions.length > 0 && (
                                         <ul className="absolute z-10 w-1/2 mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                             {filteredSuggestions.map(suggestion => (
                                                 <li key={suggestion} onMouseDown={() => { handleIngredientChange(index, 'name', suggestion); setActiveSuggestionIndex(-1); }} className="p-2 hover:bg-gray-100 cursor-pointer">{suggestion}</li>
                                             ))}
                                         </ul>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addIngredientField} className="mt-2 text-sm text-green-600 hover:text-green-800 flex items-center"><Icons.Plus/>Add Ingredient</button>
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-semibold transition-colors">Save Recipe</button>
                    </form>
                </div>
                
                {/* Right Panel */}
                <div className="space-y-8">
                    {/* CSV Import */}
                    <div className="border p-6 rounded-lg bg-gray-50">
                        <div className="flex items-center mb-4"><Icons.Upload/><h3 className="text-xl font-semibold text-gray-700">Import Recipes</h3></div>
                        <p className="text-gray-600 mb-4">Upload a CSV file to add multiple recipes at once.</p>
                        <div className="flex gap-4">
                           <button onClick={handleDownloadCsvTemplate} className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 font-semibold transition-colors flex items-center justify-center"><Icons.Download /> Template</button>
                            <button onClick={handleCsvImport} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center">Import CSV</button>
                        </div>
                    </div>

                    {/* Created Recipes List */}
                    {createdRecipes.length > 0 && (
                        <div className="border p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">Added Recipes</h3>
                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                {createdRecipes.map((recipe, index) => ( <li key={index} className="p-2 bg-green-50 rounded-md font-medium text-green-800">{recipe.name}</li>))}
                            </ul>
                             <button onClick={() => onRecipesAdded(createdRecipes)} className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 font-semibold transition-colors flex items-center justify-center">Finish & Start Importing <Icons.RightArrow/></button>
                        </div>
                    )}
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
        <div className="relative">
            <form onSubmit={handleFormSubmit}>
                <div className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => setSuggestionsVisible(true)}
                        onBlur={() => setTimeout(() => setSuggestionsVisible(false), 150)} // Delay to allow click
                        className="w-full p-2 border rounded-md"
                        placeholder="Add food item..."
                    />
                    <button type="submit" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"><Icons.Plus/></button>
                </div>
            </form>
            {suggestionsVisible && inputValue && filteredSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredSuggestions.map(suggestion => (
                        <li key={suggestion} onMouseDown={() => handleSuggestionClick(suggestion)} className="p-2 hover:bg-gray-100 cursor-pointer">{suggestion}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// --- Import Tracking Component ---
const ImportTracker = ({ recipes }) => {
    const CATEGORIES = ['Meat', 'Dairy', 'Greens', 'Bakery', 'Produce', 'Other', 'Seasonings and Sauces'];
    const [importData, setImportData] = useState({});

    const handleAddItem = (category, itemName) => {
        setImportData(prev => ({
            ...prev,
            [category]: { ...prev[category], [itemName]: 0 }
        }));
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

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Daily Food Import Tracker</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CATEGORIES.map(category => (
                    <div key={category} className="bg-white p-6 rounded-lg shadow-md border">
                        <h3 className="text-xl font-semibold text-green-700 mb-4">{category}</h3>
                        <div className="space-y-3 mb-4">
                            {importData[category] && Object.keys(importData[category]).map(item => (
                                <div key={item} className="flex items-center justify-between">
                                    <label className="text-gray-700">{item}</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="0.1"
                                        value={importData[category][item]}
                                        onChange={(e) => handleImportChange(category, item, e.target.value)}
                                        className="w-24 p-1 border rounded-md text-right"
                                        placeholder="lbs"
                                    />
                                </div>
                            ))}
                        </div>
                        <AddItemWithSuggest category={category} onAddItem={handleAddItem} />
                    </div>
                ))}
            </div>
            <div className="mt-10 sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 rounded-t-lg shadow-lg border text-center">
                <h3 className="text-2xl font-bold text-gray-800">
                    Total Daily Imports: <span className="text-green-600">{totalImports.toFixed(2)} lbs</span>
                </h3>
            </div>
        </div>
    );
};

// --- Main App Component ---
export default function EcoEatsTrackerApp() {
    const [recipes, setRecipes] = useState([]);
    const handleRecipesAdded = (newRecipes) => { setRecipes(prev => [...prev, ...newRecipes]); };
    return (
        <div className="bg-gray-50 min-h-screen font-sans py-10">
            {recipes.length === 0 ? (<RecipeOnboarding onRecipesAdded={handleRecipesAdded} />) : (<ImportTracker recipes={recipes} />)}
        </div>
    );
};

