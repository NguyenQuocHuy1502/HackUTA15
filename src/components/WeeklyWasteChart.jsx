import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { wasteAnalysisService, CONSISTENT_SAMPLE_DATA, WEEKDAYS } from '../lib/wasteAnalysisService';
import './WeeklyWasteChart.css';

const WeeklyWasteChart = ({ restaurantId, realTimeWasteData = null }) => {
    const [weeklyData, setWeeklyData] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState(null);
    const chartRef = useRef(null);
    const chartCanvasRef = useRef(null);

    const fetchWeeklyData = async () => {
        if (!restaurantId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const result = await wasteAnalysisService.getWeeklyWasteDataFromDashboard(restaurantId);
            
            if (result.success) {
                // If we get sample data (when Supabase tables don't exist), use consistent data
                if (result.data && result.data.length > 0 && result.data[0].entries.length === 0) {
                    // This is sample data, replace with consistent data
                    const consistentData = await generateConsistentWeeklyData();
                    setWeeklyData(consistentData);
                    createChart(consistentData);
                } else {
                    setWeeklyData(result.data);
                    createChart(result.data);
                }
            } else {
                // If error, use consistent sample data
                const consistentData = await generateConsistentWeeklyData();
                setWeeklyData(consistentData);
                createChart(consistentData);
            }
        } catch (err) {
            // If error, use consistent sample data
            const consistentData = await generateConsistentWeeklyData();
            setWeeklyData(consistentData);
            createChart(consistentData);
        } finally {
            setLoading(false);
        }
    };

    // Generate consistent weekly data for the chart
    const generateConsistentWeeklyData = async () => {
        const today = new Date();
        const consistentData = [];
        
        console.log('Generating consistent weekly data...');
        
        // First, get Sunday's actual recipes to use for all days
        let sundayRecipes = [];
        try {
            const sundayResult = await wasteAnalysisService.getTodayWasteDataWithRecipes(restaurantId);
            if (sundayResult.success && sundayResult.data.entries.length > 0) {
                sundayRecipes = sundayResult.data.entries.map(entry => entry.recipes);
                console.log('Using Sunday\'s actual recipes for all days:', sundayRecipes);
            }
        } catch (err) {
            console.log('Could not fetch Sunday recipes, using sample recipes');
        }
        
        // If no Sunday recipes, use sample recipes as fallback
        if (sundayRecipes.length === 0) {
            sundayRecipes = [
                {
                    recipe_name: 'Banh Mi',
                    recipe_ingredients: [
                        { amount_needed: 0.5, ingredients: { ingredient_name: 'Chicken', category: 'Meat' } },
                        { amount_needed: 0.2, ingredients: { ingredient_name: 'Bread', category: 'Bakery' } },
                        { amount_needed: 0.1, ingredients: { ingredient_name: 'Lettuce', category: 'Vegetables' } }
                    ]
                },
                {
                    recipe_name: 'Pho',
                    recipe_ingredients: [
                        { amount_needed: 0.8, ingredients: { ingredient_name: 'Beef', category: 'Meat' } },
                        { amount_needed: 0.3, ingredients: { ingredient_name: 'Rice Noodles', category: 'Grains' } },
                        { amount_needed: 0.2, ingredients: { ingredient_name: 'Onions', category: 'Vegetables' } }
                    ]
                },
                {
                    recipe_name: 'Spring Rolls',
                    recipe_ingredients: [
                        { amount_needed: 0.3, ingredients: { ingredient_name: 'Shrimp', category: 'Seafood' } },
                        { amount_needed: 0.2, ingredients: { ingredient_name: 'Rice Paper', category: 'Grains' } },
                        { amount_needed: 0.1, ingredients: { ingredient_name: 'Carrots', category: 'Vegetables' } }
                    ]
                }
            ];
        }
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = WEEKDAYS[i];
            
            console.log(`Processing day ${i}: ${dayName} (${dateStr})`);
            
            if (i === 0) {
                // For Sunday (today), fetch actual data
                try {
                    const result = await wasteAnalysisService.getTodayWasteDataWithRecipes(restaurantId);
                    if (result.success) {
                        consistentData.push({
                            date: dateStr,
                            totalServingsWasted: result.data.todayServingsWasted,
                            entries: result.data.entries
                        });
                        console.log(`Sunday data: ${result.data.todayServingsWasted} servings, ${result.data.entries.length} recipes`);
                    } else {
                        // Fallback to 0 if no data
                        consistentData.push({
                            date: dateStr,
                            totalServingsWasted: 0,
                            entries: []
                        });
                        console.log('Sunday data: 0 servings (fallback)');
                    }
                } catch (err) {
                    // Fallback to 0 if error
                    consistentData.push({
                        date: dateStr,
                        totalServingsWasted: 0,
                        entries: []
                    });
                    console.log('Sunday data: 0 servings (error fallback)');
                }
            } else {
                // Use consistent data for Monday-Saturday with Sunday's recipes
                const dayData = CONSISTENT_SAMPLE_DATA[dayName];
                const totalServingsWasted = dayData.wasteServings;
                
                // Generate waste entries based on consistent servings using Sunday's recipes
                const wasteEntries = [];
                let remainingServings = totalServingsWasted;
                
                // Distribute waste across Sunday's recipes consistently
                const recipesPerDay = Math.ceil(totalServingsWasted / 5); // Average 5 servings per recipe
                for (let j = 0; j < recipesPerDay && remainingServings > 0; j++) {
                    const recipe = sundayRecipes[j % sundayRecipes.length];
                    const servings = Math.min(Math.floor(remainingServings / (recipesPerDay - j)) + (j === recipesPerDay - 1 ? remainingServings % recipesPerDay : 0), remainingServings);
                    
                    if (servings > 0) {
                        wasteEntries.push({
                            waste_id: `sample_${dateStr}_${j}`,
                            servings_wasted: servings,
                            waste_date: dateStr,
                            recipes: recipe
                        });
                        
                        remainingServings -= servings;
                    }
                }
                
                consistentData.push({
                    date: dateStr,
                    totalServingsWasted,
                    entries: wasteEntries
                });
                console.log(`${dayName} data: ${totalServingsWasted} servings, ${wasteEntries.length} recipes`);
            }
        }
        
        console.log('Generated consistent data:', consistentData);
        return consistentData;
    };

    const createChart = (data) => {
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        if (!chartCanvasRef.current || !data.length) return;

        const ctx = chartCanvasRef.current.getContext('2d');
        
        // Prepare chart data
        const labels = data.map((day, index) => {
            // Show "Today" for the last day (Sunday), otherwise show the date
            if (index === data.length - 1) {
                return 'Today';
            }
            const date = new Date(day.date);
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        });
        
        // Debug: Log the labels to ensure they're correct
        console.log('Chart labels:', labels);
        console.log('Data length:', data.length);
        console.log('Last day index:', data.length - 1);
        
        const wasteData = data.map(day => day.totalServingsWasted);

        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Food Waste (servings)',
                    data: wasteData,
                    backgroundColor: [
                        '#ef4444', // Red for high waste
                        '#f97316', // Orange
                        '#eab308', // Yellow
                        '#22c55e', // Green
                        '#3b82f6', // Blue
                        '#8b5cf6', // Purple
                        '#ec4899'  // Pink
                    ],
                    borderColor: [
                        '#dc2626',
                        '#ea580c',
                        '#ca8a04',
                        '#16a34a',
                        '#2563eb',
                        '#7c3aed',
                        '#db2777'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Weekly Food Waste Analysis',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        color: '#374151'
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#374151',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const dayData = data[context.dataIndex];
                                return [
                                    `Waste: ${context.parsed.y} servings`,
                                    `Date: ${dayData.date}`,
                                    `Recipes: ${dayData.entries.length} items`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Waste Amount (servings)',
                            color: '#6b7280',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: '#6b7280',
                            callback: function(value) {
                                return value + ' servings';
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Days of the Week',
                            color: '#6b7280',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: '#6b7280'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    };

    const generateAIAnalysis = async () => {
        if (!weeklyData.length) {
            alert('No weekly data available for analysis');
            return;
        }

        setAiLoading(true);
        setError(null);

        try {
            // Use consistent data for AI analysis if we have sample data
            const dataForAnalysis = weeklyData.some(day => day.entries.length === 0) 
                ? await generateConsistentWeeklyDataWithRecipes() 
                : weeklyData;
                
            const result = await wasteAnalysisService.generateDailyImportOptimization(restaurantId, dataForAnalysis);
            
            if (result.success) {
                setAiAnalysis(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setAiLoading(false);
        }
    };

    // Generate consistent weekly data with recipes for AI analysis
    const generateConsistentWeeklyDataWithRecipes = async () => {
        const today = new Date();
        const consistentData = [];
        
        // First, get Sunday's actual recipes to use for all days
        let sundayRecipes = [];
        try {
            const sundayResult = await wasteAnalysisService.getTodayWasteDataWithRecipes(restaurantId);
            if (sundayResult.success && sundayResult.data.entries.length > 0) {
                sundayRecipes = sundayResult.data.entries.map(entry => entry.recipes);
                console.log('Using Sunday\'s actual recipes for all days:', sundayRecipes);
            }
        } catch (err) {
            console.log('Could not fetch Sunday recipes, using sample recipes');
        }
        
        // If no Sunday recipes, use sample recipes as fallback
        if (sundayRecipes.length === 0) {
            sundayRecipes = [
                {
                    recipe_name: 'Banh Mi',
                    recipe_ingredients: [
                        { amount_needed: 0.5, ingredients: { ingredient_name: 'Chicken', category: 'Meat' } },
                        { amount_needed: 0.2, ingredients: { ingredient_name: 'Bread', category: 'Bakery' } },
                        { amount_needed: 0.1, ingredients: { ingredient_name: 'Lettuce', category: 'Vegetables' } }
                    ]
                },
                {
                    recipe_name: 'Pho',
                    recipe_ingredients: [
                        { amount_needed: 0.8, ingredients: { ingredient_name: 'Beef', category: 'Meat' } },
                        { amount_needed: 0.3, ingredients: { ingredient_name: 'Rice Noodles', category: 'Grains' } },
                        { amount_needed: 0.2, ingredients: { ingredient_name: 'Onions', category: 'Vegetables' } }
                    ]
                },
                {
                    recipe_name: 'Spring Rolls',
                    recipe_ingredients: [
                        { amount_needed: 0.3, ingredients: { ingredient_name: 'Shrimp', category: 'Seafood' } },
                        { amount_needed: 0.2, ingredients: { ingredient_name: 'Rice Paper', category: 'Grains' } },
                        { amount_needed: 0.1, ingredients: { ingredient_name: 'Carrots', category: 'Vegetables' } }
                    ]
                }
            ];
        }
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = WEEKDAYS[i];
            
            if (i === 0) {
                // For Sunday (today), fetch actual data with recipes
                try {
                    const result = await wasteAnalysisService.getTodayWasteDataWithRecipes(restaurantId);
                    if (result.success && result.data.entries.length > 0) {
                        consistentData.push({
                            date: dateStr,
                            totalServingsWasted: result.data.todayServingsWasted,
                            entries: result.data.entries
                        });
                    } else {
                        // Fallback to empty data
                        consistentData.push({
                            date: dateStr,
                            totalServingsWasted: 0,
                            entries: []
                        });
                    }
                } catch (err) {
                    // Fallback to empty data
                    consistentData.push({
                        date: dateStr,
                        totalServingsWasted: 0,
                        entries: []
                    });
                }
            } else {
                // Use consistent data for Monday-Saturday with Sunday's recipes
                const dayData = CONSISTENT_SAMPLE_DATA[dayName];
                const totalServingsWasted = dayData.wasteServings;
                
                // Generate waste entries based on consistent servings using Sunday's recipes
                const wasteEntries = [];
                let remainingServings = totalServingsWasted;
                
                // Distribute waste across Sunday's recipes consistently
                const recipesPerDay = Math.ceil(totalServingsWasted / 5); // Average 5 servings per recipe
                for (let j = 0; j < recipesPerDay && remainingServings > 0; j++) {
                    const recipe = sundayRecipes[j % sundayRecipes.length];
                    const servings = Math.min(Math.floor(remainingServings / (recipesPerDay - j)) + (j === recipesPerDay - 1 ? remainingServings % recipesPerDay : 0), remainingServings);
                    
                    if (servings > 0) {
                        wasteEntries.push({
                            waste_id: `sample_${dateStr}_${j}`,
                            servings_wasted: servings,
                            waste_date: dateStr,
                            recipes: recipe
                        });
                        
                        remainingServings -= servings;
                    }
                }
                
                consistentData.push({
                    date: dateStr,
                    totalServingsWasted,
                    entries: wasteEntries
                });
            }
        }
        
        return consistentData;
    };

    useEffect(() => {
        fetchWeeklyData();
        
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [restaurantId]);

    // Ensure chart renders when data is available
    useEffect(() => {
        if (weeklyData.length > 0 && chartCanvasRef.current) {
            console.log('Data available, creating chart...');
            createChart(weeklyData);
        }
    }, [weeklyData]);

    // Refresh Sunday's data when waste is updated
    const refreshSundayData = async () => {
        if (!restaurantId) return;
        
        try {
            const result = await wasteAnalysisService.getTodayWasteDataWithRecipes(restaurantId);
            
            if (result.success) {
                const updatedWeeklyData = [...weeklyData];
                const sundayIndex = updatedWeeklyData.length - 1; // Sunday is the last day
                
                // Update Sunday's data with fresh data
                updatedWeeklyData[sundayIndex] = {
                    ...updatedWeeklyData[sundayIndex],
                    totalServingsWasted: result.data.todayServingsWasted,
                    entries: result.data.entries
                };
                
                setWeeklyData(updatedWeeklyData);
                createChart(updatedWeeklyData);
            }
        } catch (err) {
            console.error('Error refreshing Sunday data:', err);
        }
    };

    const totalWeeklyWaste = weeklyData.reduce((sum, day) => sum + day.totalServingsWasted, 0);
    const averageDailyWaste = weeklyData.length > 0 ? totalWeeklyWaste / weeklyData.length : 0;

    return (
        <div className="space-y-8">
            {/* Chart Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Weekly Waste Analysis</h3>
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={fetchWeeklyData}
                            disabled={loading}
                            className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 text-sm font-medium"
                        >
                            {loading ? 'Loading...' : 'Refresh'}
                        </button>
                        <button
                            onClick={refreshSundayData}
                            disabled={loading}
                            className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 text-sm font-medium"
                        >
                            Update Today
                        </button>
                        <button
                            onClick={() => {
                                if (weeklyData.length > 0) {
                                    createChart(weeklyData);
                                }
                            }}
                            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm"
                        >
                            Force Refresh Chart
                        </button>
                        <button
                            onClick={generateAIAnalysis}
                            disabled={aiLoading || !weeklyData.length}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 text-sm font-semibold"
                        >
                            {aiLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Generating...
                                </div>
                            ) : (
                                'AI-Powered Analysis'
                            )}
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-red-600 font-medium">Total Weekly Waste</p>
                        <p className="text-2xl font-bold text-red-700">{totalWeeklyWaste} servings</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-orange-600 font-medium">Average Daily Waste</p>
                        <p className="text-2xl font-bold text-orange-700">{averageDailyWaste.toFixed(1)} servings</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-blue-600 font-medium">Peak Waste Day</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {weeklyData.length > 0 ? 
                                Math.max(...weeklyData.map(d => d.totalServingsWasted)) + ' servings' : 
                                'N/A'
                            }
                        </p>
                    </div>
                </div>

                {/* Chart */}
                <div className="relative h-96">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full text-red-600">
                            <div className="text-center">
                                <p className="text-lg font-semibold mb-2">Error Loading Chart</p>
                                <p>{error}</p>
                                <button 
                                    onClick={fetchWeeklyData}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : (
                        <canvas ref={chartCanvasRef}></canvas>
                    )}
                </div>
            </div>

            {/* AI Generate Button */}
            <div className="ai-button-container">
                <button
                    onClick={generateAIAnalysis}
                    disabled={aiLoading || !weeklyData.length}
                    className="ai-button"
                >
                    {aiLoading ? (
                        <div className="ai-button-loading">
                            <div className="ai-button-spinner"></div>
                            <span>Generating AI Analysis...</span>
                        </div>
                    ) : (
                        <span className="ai-button-text">AI-Powered Analysis</span>
                    )}
                </button>
                {!weeklyData.length && (
                    <p className="ai-warning-text">Load data first to enable AI analysis (Data length: {weeklyData.length})</p>
                )}
                <p className="ai-debug-text">Button state: {aiLoading ? 'Loading' : 'Ready'} | Data: {weeklyData.length} items</p>
            </div>

            {/* AI Analysis Results */}
            {aiAnalysis && (
                <div className="ai-results-container animate-fadeIn">
                    <div className="ai-results-header">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="ai-results-title">
                            Analysis Results
                        </h3>
                    </div>
                    
                    {/* Summary */}
                    <div className="ai-summary-section">
                        <div className="ai-summary-header">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-green-800">Analysis Summary</h4>
                        </div>
                        <p className="ai-summary-text">{aiAnalysis.summary}</p>
                    </div>

                    {/* Ingredient Analysis */}
                    <div className="ai-ingredient-section">
                        <div className="ai-ingredient-header">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h4 className="ai-ingredient-title">Ingredient-Specific Import Recommendations</h4>
                        </div>
                        <div className="space-y-8">
                            {aiAnalysis.ingredientAnalysis?.map((ingredient, index) => (
                                <div key={index} className="ai-ingredient-card">
                                    <div className="ai-ingredient-header-info">
                                        <div className="ai-ingredient-main-info">
                                            <div className="ai-ingredient-number">
                                                {index + 1}
                                            </div>
                                            <div className="ai-ingredient-details">
                                                <p className="ai-ingredient-name">{ingredient.ingredientName}</p>
                                                <p className="ai-ingredient-meta">
                                                    <span className="ai-category-tag">
                                                        {ingredient.category}
                                                    </span>
                                                    <span className="ai-waste-info">{ingredient.totalWasteLbs} lbs total waste</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="ai-recipes-info">
                                            <p className="ai-recipes-label">Recipes Affected</p>
                                            <p className="ai-recipes-list">{ingredient.recipesAffected?.join(', ')}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Daily Recommendations */}
                                    <div className="ai-daily-grid">
                                        {ingredient.dailyRecommendations?.map((day, dayIndex) => (
                                            <div key={dayIndex} className="ai-daily-card">
                                                <p className="ai-daily-title">{day.day}</p>
                                                <div className="ai-daily-stats">
                                                    <div className="ai-daily-stat">
                                                        <div className="ai-stat-dot ai-stat-dot-red"></div>
                                                        <p className="ai-stat-text ai-stat-text-red">Waste: {day.currentWaste}</p>
                                                    </div>
                                                    <div className="ai-daily-stat">
                                                        <div className="ai-stat-dot ai-stat-dot-green"></div>
                                                        <p className="ai-stat-text ai-stat-text-green">Import: {day.recommendedImport}</p>
                                                    </div>
                                                    <div className="ai-daily-stat">
                                                        <div className="ai-stat-dot ai-stat-dot-emerald"></div>
                                                        <p className="ai-stat-text ai-stat-text-emerald">-{day.reductionPercentage}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Key Insights */}
                                    {ingredient.keyInsights && (
                                        <div className="ai-insights-section">
                                            <div className="ai-insights-header">
                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <p className="ai-insights-title">Key Insights</p>
                                            </div>
                                            <div className="ai-insights-list">
                                                {ingredient.keyInsights.map((insight, insightIndex) => (
                                                    <div key={insightIndex} className="ai-insights-item">
                                                        <div className="ai-insights-bullet"></div>
                                                        <span className="ai-insights-text">{insight}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Overall Recommendations */}
                    <div className="ai-recommendations-section">
                        <div className="ai-recommendations-header">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="ai-recommendations-title">Overall Recommendations</h4>
                        </div>
                        <div className="ai-recommendations-list">
                            {aiAnalysis.overallRecommendations?.map((rec, index) => (
                                <div key={index} className="ai-recommendation-item">
                                    <div className="ai-recommendation-number">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="ai-recommendation-text">{rec}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Potential Savings */}
                    {aiAnalysis.potentialSavings && (
                        <div className="ai-savings-section">
                            <div className="ai-savings-header">
                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <h4 className="ai-savings-title">Potential Savings</h4>
                            </div>
                            <div className="ai-savings-grid">
                                <div className="ai-savings-card">
                                    <div className="ai-savings-icon">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <p className="ai-savings-label">Weekly Reduction</p>
                                    <p className="ai-savings-value">{aiAnalysis.potentialSavings.weeklyWasteReduction}</p>
                                </div>
                                <div className="ai-savings-card">
                                    <div className="ai-savings-icon">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="ai-savings-label">Monthly Savings</p>
                                    <p className="ai-savings-value">{aiAnalysis.potentialSavings.monthlySavings}</p>
                                </div>
                                <div className="ai-savings-card">
                                    <div className="ai-savings-icon">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <p className="ai-savings-label">Annual Savings</p>
                                    <p className="ai-savings-value">{aiAnalysis.potentialSavings.annualSavings}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WeeklyWasteChart;
