import { supabase } from './supabase.js';
import { GoogleGenAI } from "@google/genai";

// Days of the week constant
export const WEEKDAYS = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Consistent sample data for Monday-Saturday (Sunday will use real data)
export const CONSISTENT_SAMPLE_DATA = {
  Monday: { wasteServings: 15, rescueServings: 8 },
  Tuesday: { wasteServings: 12, rescueServings: 6 },
  Wednesday: { wasteServings: 18, rescueServings: 10 },
  Thursday: { wasteServings: 14, rescueServings: 7 },
  Friday: { wasteServings: 22, rescueServings: 12 },
  Saturday: { wasteServings: 25, rescueServings: 15 },
  Sunday: { wasteServings: 0, rescueServings: 0 } // Will be replaced with real data
};

// Waste Analysis Service
export const wasteAnalysisService = {
  // Calculate ingredient waste per pound based on wasted recipes
  async calculateIngredientWaste(restaurantId, dateRange = null) {
    try {
      console.log('Starting ingredient waste calculation...');
      
      // Build query for waste data with recipes and ingredients
      let wasteQuery = supabase
        .from('waste')
        .select(`
          waste_id,
          servings_wasted,
          waste_date,
          recipes (
            recipe_id,
            recipe_name,
            recipe_ingredients (
              amount_needed,
              ingredients (
                ingredient_id,
                ingredient_name,
                category
              )
            )
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_claimed', false); // Only unclaimed waste

      // Add date filter if provided
      if (dateRange) {
        if (dateRange.start) {
          wasteQuery = wasteQuery.gte('waste_date', dateRange.start);
        }
        if (dateRange.end) {
          wasteQuery = wasteQuery.lte('waste_date', dateRange.end);
        }
      }

      const { data: wasteData, error: wasteError } = await wasteQuery;

      if (wasteError) {
        console.error('Error fetching waste data:', wasteError);
        // Check if it's a table structure issue
        if (wasteError.message.includes('does not exist') || wasteError.message.includes('column')) {
          console.log('Waste table or columns may not exist yet. Returning empty analysis.');
          return { 
            success: true, 
            data: {
              totalServingsWasted: 0,
              totalIngredientWasteLbs: 0,
              ingredientBreakdown: [],
              summary: {
                totalIngredientsAffected: 0,
                topWastedIngredient: null,
                averageWastePerIngredient: 0
              }
            }
          };
        }
        throw wasteError;
      }

      console.log('Fetched waste data:', wasteData);

      // Calculate ingredient waste
      const ingredientWasteMap = new Map();
      let totalServingsWasted = 0;

      for (const wasteEntry of wasteData) {
        const servingsWasted = wasteEntry.servings_wasted;
        totalServingsWasted += servingsWasted;

        if (wasteEntry.recipes && wasteEntry.recipes.recipe_ingredients) {
          for (const recipeIngredient of wasteEntry.recipes.recipe_ingredients) {
            if (recipeIngredient.ingredients) {
              const ingredient = recipeIngredient.ingredients;
              const amountPerServing = recipeIngredient.amount_needed; // This is in lbs per serving
              
              // Calculate total ingredient waste for this recipe
              const totalIngredientWaste = amountPerServing * servingsWasted;
              
              const ingredientKey = `${ingredient.ingredient_id}_${ingredient.ingredient_name}`;
              
              if (ingredientWasteMap.has(ingredientKey)) {
                const existing = ingredientWasteMap.get(ingredientKey);
                existing.totalWasteLbs += totalIngredientWaste;
                existing.occurrences += 1;
                existing.recipes.add(wasteEntry.recipes.recipe_name);
              } else {
                ingredientWasteMap.set(ingredientKey, {
                  ingredientId: ingredient.ingredient_id,
                  ingredientName: ingredient.ingredient_name,
                  category: ingredient.category,
                  totalWasteLbs: totalIngredientWaste,
                  occurrences: 1,
                  recipes: new Set([wasteEntry.recipes.recipe_name])
                });
              }
            }
          }
        }
      }

      // Convert Map to Array and calculate percentages
      const ingredientWasteArray = Array.from(ingredientWasteMap.values()).map(item => ({
        ...item,
        recipes: Array.from(item.recipes),
        percentageOfTotal: totalServingsWasted > 0 ? (item.totalWasteLbs / totalServingsWasted) * 100 : 0
      }));

      // Sort by total waste (descending)
      ingredientWasteArray.sort((a, b) => b.totalWasteLbs - a.totalWasteLbs);

      const result = {
        totalServingsWasted,
        totalIngredientWasteLbs: ingredientWasteArray.reduce((sum, item) => sum + item.totalWasteLbs, 0),
        ingredientBreakdown: ingredientWasteArray,
        summary: {
          totalIngredientsAffected: ingredientWasteArray.length,
          topWastedIngredient: ingredientWasteArray[0] || null,
          averageWastePerIngredient: ingredientWasteArray.length > 0 
            ? ingredientWasteArray.reduce((sum, item) => sum + item.totalWasteLbs, 0) / ingredientWasteArray.length 
            : 0
        }
      };

      console.log('Calculated ingredient waste:', result);
      return { success: true, data: result };

    } catch (error) {
      console.error('Error calculating ingredient waste:', error);
      return { success: false, error: error.message };
    }
  },

  // Get storage data for comparison
  async getStorageData(restaurantId, dateRange = null) {
    try {
      let storageQuery = supabase
        .from('storage')
        .select(`
          restaurant_id,
          ingredient_id,
          weight_lbs,
          import_date,
          ingredients (
            ingredient_id,
            ingredient_name,
            category
          )
        `)
        .eq('restaurant_id', restaurantId);

      // Add date filter if provided
      if (dateRange) {
        if (dateRange.start) {
          storageQuery = storageQuery.gte('import_date', dateRange.start);
        }
        if (dateRange.end) {
          storageQuery = storageQuery.lte('import_date', dateRange.end);
        }
      }

      const { data: storageData, error: storageError } = await storageQuery;

      if (storageError) {
        console.error('Error fetching storage data:', storageError);
        // Check if it's a table structure issue
        if (storageError.message.includes('does not exist') || storageError.message.includes('column')) {
          console.log('Storage table or columns may not exist yet. Returning empty storage data.');
          return {
            success: true,
            data: {
              totalImportedLbs: 0,
              ingredientImports: [],
              summary: {
                totalIngredientsImported: 0,
                topImportedIngredient: null
              }
            }
          };
        }
        throw storageError;
      }

      // Aggregate storage data by ingredient
      const storageMap = new Map();
      let totalImportedLbs = 0;

      for (const storageEntry of storageData) {
        if (storageEntry.ingredients) {
          const ingredient = storageEntry.ingredients;
          const weightLbs = storageEntry.weight_lbs;
          totalImportedLbs += weightLbs;

          const ingredientKey = `${ingredient.ingredient_id}_${ingredient.ingredient_name}`;
          
          if (storageMap.has(ingredientKey)) {
            const existing = storageMap.get(ingredientKey);
            existing.totalImportedLbs += weightLbs;
            existing.importCount += 1;
          } else {
            storageMap.set(ingredientKey, {
              ingredientId: ingredient.ingredient_id,
              ingredientName: ingredient.ingredient_name,
              category: ingredient.category,
              totalImportedLbs: weightLbs,
              importCount: 1
            });
          }
        }
      }

      const storageArray = Array.from(storageMap.values());
      storageArray.sort((a, b) => b.totalImportedLbs - a.totalImportedLbs);

      return {
        success: true,
        data: {
          totalImportedLbs,
          ingredientImports: storageArray,
          summary: {
            totalIngredientsImported: storageArray.length,
            topImportedIngredient: storageArray[0] || null
          }
        }
      };

    } catch (error) {
      console.error('Error fetching storage data:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate comprehensive waste analysis for Gemini API
  async generateWasteAnalysisForGemini(restaurantId, dateRange = null) {
    try {
      console.log('Generating comprehensive waste analysis...');

      // Get both waste and storage data
      const [wasteResult, storageResult] = await Promise.all([
        this.calculateIngredientWaste(restaurantId, dateRange),
        this.getStorageData(restaurantId, dateRange)
      ]);

      if (!wasteResult.success || !storageResult.success) {
        throw new Error(`Failed to fetch data: ${wasteResult.error || storageResult.error}`);
      }

      const wasteData = wasteResult.data;
      const storageData = storageResult.data;

      // Create comprehensive analysis data
      const analysisData = {
        dateRange: dateRange || { start: null, end: null },
        summary: {
          totalServingsWasted: wasteData.totalServingsWasted,
          totalIngredientWasteLbs: wasteData.totalIngredientWasteLbs,
          totalImportedLbs: storageData.totalImportedLbs,
          wasteEfficiency: storageData.totalImportedLbs > 0 
            ? ((storageData.totalImportedLbs - wasteData.totalIngredientWasteLbs) / storageData.totalImportedLbs) * 100
            : 0
        },
        ingredientAnalysis: [],
        recommendations: []
      };

      // Cross-reference waste and storage data
      const wasteMap = new Map();
      wasteData.ingredientBreakdown.forEach(item => {
        wasteMap.set(item.ingredientId, item);
      });

      const storageMap = new Map();
      storageData.ingredientImports.forEach(item => {
        storageMap.set(item.ingredientId, item);
      });

      // Create comprehensive ingredient analysis
      const allIngredientIds = new Set([
        ...wasteData.ingredientBreakdown.map(item => item.ingredientId),
        ...storageData.ingredientImports.map(item => item.ingredientId)
      ]);

      for (const ingredientId of allIngredientIds) {
        const wasteInfo = wasteMap.get(ingredientId);
        const storageInfo = storageMap.get(ingredientId);

        const analysis = {
          ingredientId,
          ingredientName: wasteInfo?.ingredientName || storageInfo?.ingredientName,
          category: wasteInfo?.category || storageInfo?.category,
          totalImportedLbs: storageInfo?.totalImportedLbs || 0,
          totalWastedLbs: wasteInfo?.totalWasteLbs || 0,
          wastePercentage: storageInfo?.totalImportedLbs > 0 
            ? (wasteInfo?.totalWasteLbs || 0) / storageInfo.totalImportedLbs * 100
            : 0,
          recipesAffected: wasteInfo?.recipes || [],
          importCount: storageInfo?.importCount || 0,
          wasteOccurrences: wasteInfo?.occurrences || 0
        };

        analysisData.ingredientAnalysis.push(analysis);
      }

      // Sort by waste percentage (descending)
      analysisData.ingredientAnalysis.sort((a, b) => b.wastePercentage - a.wastePercentage);

      // Generate recommendations
      const topWastedIngredients = analysisData.ingredientAnalysis
        .filter(item => item.totalWastedLbs > 0)
        .slice(0, 3);

      // Helper function for generating ingredient recommendations
      const generateIngredientRecommendation = (ingredient) => {
        const wastePercentage = ingredient.wastePercentage;
        const wasteAmount = ingredient.totalWastedLbs;
        const recipes = ingredient.recipesAffected || [];

        if (wastePercentage > 50) {
          return `Critical: ${ingredient.ingredientName} has ${wastePercentage.toFixed(1)}% waste rate. Consider reducing prep by ${(wasteAmount * 0.3).toFixed(1)} lbs and reviewing recipes: ${recipes.join(', ')}`;
        } else if (wastePercentage > 25) {
          return `High Priority: ${ingredient.ingredientName} shows ${wastePercentage.toFixed(1)}% waste. Reduce prep by ${(wasteAmount * 0.2).toFixed(1)} lbs and optimize ${recipes.join(', ')} recipes`;
        } else if (wastePercentage > 10) {
          return `Moderate: ${ingredient.ingredientName} has ${wastePercentage.toFixed(1)}% waste. Fine-tune prep quantities by ${(wasteAmount * 0.15).toFixed(1)} lbs`;
        } else {
          return `Good: ${ingredient.ingredientName} shows low waste at ${wastePercentage.toFixed(1)}%. Maintain current practices`;
        }
      };

      topWastedIngredients.forEach((ingredient, index) => {
        if (ingredient.totalWastedLbs > 0) {
          analysisData.recommendations.push({
            priority: index + 1,
            ingredient: ingredient.ingredientName,
            category: ingredient.category,
            wasteAmount: ingredient.totalWastedLbs,
            wastePercentage: ingredient.wastePercentage,
            suggestion: generateIngredientRecommendation(ingredient)
          });
        }
      });

      console.log('Generated comprehensive analysis:', analysisData);
      return { success: true, data: analysisData };

    } catch (error) {
      console.error('Error generating waste analysis:', error);
      return { success: false, error: error.message };
    }
  },

  // Get weekly waste data from existing dashboard data
  async getWeeklyWasteDataFromDashboard(restaurantId) {
    try {
      console.log('Fetching weekly waste data from dashboard...');
      
      // Get waste data with recipes and ingredients
      const { data: wasteData, error: wasteError } = await supabase
        .from('waste')
        .select(`
          waste_id,
          servings_wasted,
          waste_date,
          recipes (
            recipe_id,
            recipe_name,
            recipe_ingredients (
              amount_needed,
              ingredients (
                ingredient_id,
                ingredient_name,
                category
              )
            )
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_claimed', false)
        .order('waste_date', { ascending: true });

      if (wasteError) {
        console.error('Error fetching waste data:', wasteError);
        if (wasteError.message.includes('does not exist') || wasteError.message.includes('column')) {
          console.log('Waste table may not exist yet. Returning sample data.');
          return { success: true, data: this.generateSampleWeeklyDataWithRecipes() };
        }
        throw wasteError;
      }

      // Process waste data by day
      const dailyWasteMap = new Map();
      
      for (const wasteEntry of wasteData) {
        const wasteDate = wasteEntry.waste_date;
        const servingsWasted = wasteEntry.servings_wasted;
        
        if (dailyWasteMap.has(wasteDate)) {
          const existing = dailyWasteMap.get(wasteDate);
          existing.totalServingsWasted += servingsWasted;
          existing.entries.push(wasteEntry);
        } else {
          dailyWasteMap.set(wasteDate, {
            date: wasteDate,
            totalServingsWasted: servingsWasted,
            entries: [wasteEntry]
          });
        }
      }

      // Generate 7 days of data (including missing days with 0 waste)
      const weeklyData = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = dailyWasteMap.get(dateStr) || {
          date: dateStr,
          totalServingsWasted: 0,
          entries: []
        };
        
        weeklyData.push(dayData);
      }

      console.log('Processed weekly waste data:', weeklyData);
      return { success: true, data: weeklyData };

    } catch (error) {
      console.error('Error fetching weekly waste data:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate sample data with realistic recipes using consistent values
  generateSampleWeeklyDataWithRecipes() {
    const sampleData = [];
    const today = new Date();
    
    // Sample recipes with ingredients
    const sampleRecipes = [
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
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = WEEKDAYS[i];
      
      // Use consistent data for Monday-Saturday, real data for Sunday
      const dayData = CONSISTENT_SAMPLE_DATA[dayName];
      const totalServingsWasted = dayData.wasteServings;
      
      // Generate waste entries based on consistent servings
      const wasteEntries = [];
      let remainingServings = totalServingsWasted;
      
      // Distribute waste across recipes consistently
      const recipesPerDay = Math.ceil(totalServingsWasted / 5); // Average 5 servings per recipe
      for (let j = 0; j < recipesPerDay && remainingServings > 0; j++) {
        const recipe = sampleRecipes[j % sampleRecipes.length];
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
      
      sampleData.push({
        date: dateStr,
        totalServingsWasted,
        entries: wasteEntries
      });
    }
    
    return sampleData;
  },

  // Calculate ingredient waste from recipe data
  calculateIngredientWasteFromRecipes(weeklyData) {
    const ingredientWasteMap = new Map();
    
    for (const dayData of weeklyData) {
      const date = dayData.date;
      
      for (const wasteEntry of dayData.entries) {
        if (wasteEntry.recipes && wasteEntry.recipes.recipe_ingredients) {
          const servingsWasted = wasteEntry.servings_wasted;
          
          for (const recipeIngredient of wasteEntry.recipes.recipe_ingredients) {
            if (recipeIngredient.ingredients) {
              const ingredient = recipeIngredient.ingredients;
              const amountPerServing = recipeIngredient.amount_needed; // lbs per serving
              const totalIngredientWaste = amountPerServing * servingsWasted;
              
              const ingredientKey = ingredient.ingredient_name;
              
              if (ingredientWasteMap.has(ingredientKey)) {
                const existing = ingredientWasteMap.get(ingredientKey);
                existing.totalWasteLbs += totalIngredientWaste;
                existing.dailyBreakdown[date] = (existing.dailyBreakdown[date] || 0) + totalIngredientWaste;
                existing.recipes.add(wasteEntry.recipes.recipe_name);
              } else {
                ingredientWasteMap.set(ingredientKey, {
                  ingredientName: ingredient.ingredient_name,
                  category: ingredient.category,
                  totalWasteLbs: totalIngredientWaste,
                  dailyBreakdown: { [date]: totalIngredientWaste },
                  recipes: new Set([wasteEntry.recipes.recipe_name])
                });
              }
            }
          }
        }
      }
    }
    
    // Convert to array and add daily recommendations
    const ingredientAnalysis = Array.from(ingredientWasteMap.values()).map(item => ({
      ...item,
      recipes: Array.from(item.recipes),
      dailyRecommendations: this.generateDailyImportRecommendations(item, weeklyData)
    }));
    
    // Sort by total waste
    ingredientAnalysis.sort((a, b) => b.totalWasteLbs - a.totalWasteLbs);
    
    return ingredientAnalysis;
  },

  // Generate daily import recommendations for each ingredient
  generateDailyImportRecommendations(ingredient, weeklyData) {
    const recommendations = [];
    
    for (let i = 0; i < 7; i++) {
      const date = weeklyData[i].date;
      const dayName = WEEKDAYS[i];
      const wasteAmount = ingredient.dailyBreakdown[date] || 0;
      
      // Calculate recommended import (waste amount + buffer)
      const buffer = wasteAmount * 0.2; // 20% buffer
      const recommendedImport = Math.max(wasteAmount + buffer, 0.5); // Minimum 0.5 lbs
      
      recommendations.push({
        day: dayName,
        date: date,
        currentWaste: wasteAmount.toFixed(1),
        recommendedImport: recommendedImport.toFixed(1),
        reductionPercentage: wasteAmount > 0 ? Math.round((buffer / (wasteAmount + buffer)) * 100) : 0,
        reasoning: wasteAmount > 0 
          ? `Based on ${wasteAmount.toFixed(1)} lbs wasted, import ${recommendedImport.toFixed(1)} lbs with 20% buffer`
          : `No waste recorded, import minimum 0.5 lbs`
      });
    }
    
    return recommendations;
  },

  // Generate AI analysis for daily import optimization based on recipe ingredients
  async generateDailyImportOptimization(restaurantId, weeklyData) {
    try {
      console.log('Generating daily import optimization analysis...');

      // Calculate ingredient waste from recipes
      const ingredientAnalysis = this.calculateIngredientWasteFromRecipes(weeklyData);

      const prompt = `
You are a food waste reduction expert analyzing restaurant waste data. Based on the following weekly waste data and ingredient analysis, provide specific recommendations for daily import optimization.

WEEKLY WASTE DATA:
${JSON.stringify(weeklyData, null, 2)}

INGREDIENT ANALYSIS:
${JSON.stringify(ingredientAnalysis, null, 2)}

ANALYSIS REQUIREMENTS:
1. Analyze waste patterns by day of the week for each ingredient
2. Identify peak waste days and low waste days for each ingredient
3. Calculate optimal import amounts for each ingredient per day
4. Provide specific percentage reductions for each ingredient per day
5. Suggest inventory management strategies based on recipe patterns

Return a JSON object with this exact structure:
{
  "summary": "One-sentence summary of the waste pattern analysis",
  "ingredientAnalysis": [
    {
      "ingredientName": "Chicken",
      "category": "Meat",
      "totalWasteLbs": "X.X",
      "dailyRecommendations": [
        {
          "day": "Monday",
          "date": "2025-01-06",
          "currentWaste": "X.X lbs",
          "recommendedImport": "Y.Y lbs",
          "reductionPercentage": "Z%",
          "reasoning": "Specific reason for this recommendation"
        }
      ],
      "recipesAffected": ["Banh Mi", "Pho"],
      "keyInsights": ["Insight 1", "Insight 2"]
    }
  ],
  "overallRecommendations": [
    "Overall recommendation 1 with specific amounts",
    "Overall recommendation 2 with percentages",
    "Strategic recommendation 3 for inventory management"
  ],
  "potentialSavings": {
    "weeklyWasteReduction": "X.X lbs",
    "monthlySavings": "$XXX",
    "annualSavings": "$XXXX"
  }
}

IMPORTANT: 
- Focus on specific ingredients and their daily import needs
- Base recommendations on actual recipe waste patterns
- Provide exact amounts in lbs for each ingredient per day
- Calculate realistic savings based on ingredient costs`;

      // Initialize Gemini AI client
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      if (!apiKey) {
        throw new Error("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disable thinking for faster response
          },
        }
      });

      if (response.text) {
        const rawText = response.text;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No valid JSON object found in the AI response.");
        }
        
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('Generated AI analysis:', parsedData);
        return { success: true, data: parsedData };
      } else {
        throw new Error("Could not get a valid response from the AI.");
      }

    } catch (error) {
      console.error('Error generating AI analysis:', error);
      return { success: false, error: error.message };
    }
  },

  // Get today's waste data with recipes for real-time updates
  async getTodayWasteDataWithRecipes(restaurantId) {
    try {
      console.log('Fetching today\'s waste data with recipes...');
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data: wasteData, error: wasteError } = await supabase
        .from('waste')
        .select(`
          waste_id,
          servings_wasted,
          waste_date,
          recipes (
            recipe_id,
            recipe_name,
            recipe_ingredients (
              amount_needed,
              ingredients (
                ingredient_id,
                ingredient_name,
                category
              )
            )
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_claimed', false)
        .eq('waste_date', today)
        .order('waste_id', { ascending: true });

      if (wasteError) {
        console.error('Error fetching today\'s waste data:', wasteError);
        if (wasteError.message.includes('does not exist') || wasteError.message.includes('column')) {
          console.log('Waste table may not exist yet. Returning empty data.');
          return { 
            success: true, 
            data: {
              todayServingsWasted: 0,
              entries: []
            }
          };
        }
        throw wasteError;
      }

      // Calculate total servings wasted today
      const totalServingsWasted = wasteData.reduce((sum, entry) => sum + entry.servings_wasted, 0);

      const result = {
        todayServingsWasted: totalServingsWasted,
        entries: wasteData
      };

      console.log('Today\'s waste data:', result);
      return { success: true, data: result };

    } catch (error) {
      console.error('Error fetching today\'s waste data:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate specific recommendation for an ingredient
  generateIngredientRecommendation(ingredient) {
    const wastePercentage = ingredient.wastePercentage;
    const wasteAmount = ingredient.totalWastedLbs;
    const recipes = ingredient.recipesAffected;

    if (wastePercentage > 50) {
      return `Critical: ${ingredient.ingredientName} has ${wastePercentage.toFixed(1)}% waste rate. Consider reducing prep by ${(wasteAmount * 0.3).toFixed(1)} lbs and reviewing recipes: ${recipes.join(', ')}`;
    } else if (wastePercentage > 25) {
      return `High Priority: ${ingredient.ingredientName} shows ${wastePercentage.toFixed(1)}% waste. Reduce prep by ${(wasteAmount * 0.2).toFixed(1)} lbs and optimize ${recipes.join(', ')} recipes`;
    } else if (wastePercentage > 10) {
      return `Moderate: ${ingredient.ingredientName} has ${wastePercentage.toFixed(1)}% waste. Fine-tune prep quantities by ${(wasteAmount * 0.15).toFixed(1)} lbs`;
    } else {
      return `Good: ${ingredient.ingredientName} shows low waste at ${wastePercentage.toFixed(1)}%. Maintain current practices`;
    }
  }
};
