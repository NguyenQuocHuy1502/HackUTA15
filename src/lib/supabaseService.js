import { supabase } from './supabase'

// Restaurant Service
export const restaurantService = {
  // Create a new restaurant
  async createRestaurant(restaurantData) {
    try {
      const { data: result, error } = await supabase
        .from('restaurants')
        .insert([{
          restaurant_name: restaurantData.name,
          address: restaurantData.address,
          phone_number: restaurantData.phone,
          email: restaurantData.email
        }])
        .select()

      if (error) throw error
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Error creating restaurant:', error)
      return { success: false, error: error.message }
    }
  },

  // Create a new restaurant with specific ID (for Auth0 integration)
  async createRestaurantWithId(restaurantId, restaurantData) {
    try {
      console.log('Creating restaurant with ID:', restaurantId, 'Data:', restaurantData)
      
      const { data: result, error } = await supabase
        .from('restaurants')
        .insert([{
          restaurant_id: restaurantId,
          restaurant_name: restaurantData.name,
          address: restaurantData.address,
          phone_number: restaurantData.phone,
          email: restaurantData.email
        }])
        .select()

      if (error) {
        console.error('Error creating restaurant with ID:', error)
        throw error
      }
      
      console.log('Restaurant created with ID:', result[0])
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Error creating restaurant with ID:', error)
      return { success: false, error: error.message }
    }
  },

  // Get restaurant by email
  async getRestaurantByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('email', email)
        .maybeSingle() // Use maybeSingle() instead of single() to handle no results gracefully

      if (error) throw error
      
      // If no data found, return success: false (not an error, just doesn't exist)
      if (!data) {
        return { success: false, error: 'Restaurant not found' }
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching restaurant:', error)
      return { success: false, error: error.message }
    }
  }
}

// Recipe Service
export const recipeService = {
  // Create a new recipe
  async createRecipe(restaurantId, recipeData) {
    try {
      console.log('Creating recipe:', recipeData.name, 'for restaurant:', restaurantId)
      
      // First check if recipe already exists for this restaurant
      const { data: existing, error: searchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('recipe_name', recipeData.name)
        .single()
      
      if (existing && !searchError) {
        console.log('Recipe already exists:', existing)
        return { success: true, data: existing }
      }
      
      const { data: result, error } = await supabase
        .from('recipes')
        .insert([{
          restaurant_id: restaurantId,
          recipe_name: recipeData.name
        }])
        .select()

      if (error) {
        console.error('Error creating recipe:', error)
        throw error
      }
      
      console.log('Successfully created recipe:', result[0])
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Error creating recipe:', error)
      return { success: false, error: error.message }
    }
  },

  // Save complete recipe with ingredients to both recipes and recipe_ingredients tables
  async saveRecipeWithIngredients(restaurantId, recipeData) {
    try {
      console.log('Saving complete recipe:', recipeData.name, 'for restaurant:', restaurantId)
      console.log('Recipe ingredients:', recipeData.ingredients)
      
      // First check if recipe already exists for this restaurant
      const { data: existingRecipe, error: searchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('recipe_name', recipeData.name)
        .single()
      
      let recipeId
      
      if (existingRecipe && !searchError) {
        console.log('Recipe already exists, using existing ID:', existingRecipe.recipe_id)
        recipeId = existingRecipe.recipe_id
        
        // Delete existing recipe_ingredients for this recipe
        const { error: deleteError } = await supabase
          .from('recipe_ingredients')
          .delete()
          .eq('recipe_id', recipeId)
        
        if (deleteError) {
          console.error('Error deleting existing recipe ingredients:', deleteError)
          throw deleteError
        }
      } else {
        // Create new recipe
        const { data: newRecipe, error: createError } = await supabase
          .from('recipes')
          .insert([{
            restaurant_id: restaurantId,
            recipe_name: recipeData.name
          }])
          .select()

        if (createError) {
          console.error('Error creating recipe:', createError)
          throw createError
        }
        
        recipeId = newRecipe[0].recipe_id
        console.log('Successfully created recipe:', newRecipe[0])
      }
      
      // Now save recipe ingredients
      const recipeIngredients = []
      
      for (const ingredient of recipeData.ingredients) {
        console.log(`Processing ingredient: ${ingredient.name} (${ingredient.amount} lbs)`)
        
        // Find ingredient in ingredients table
        const ingredientResult = await ingredientsService.findIngredientByName(ingredient.name)
        
        if (ingredientResult.success) {
          recipeIngredients.push({
            recipe_id: recipeId,
            ingredient_id: ingredientResult.data.ingredient_id,
            amount_needed: ingredient.amount
          })
          console.log(`Added ingredient ${ingredient.name} (ID: ${ingredientResult.data.ingredient_id})`)
        } else {
          console.warn(`Ingredient not found: ${ingredient.name}, skipping...`)
        }
      }
      
      if (recipeIngredients.length > 0) {
        const { data: ingredientsResult, error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(recipeIngredients)
          .select()

        if (ingredientsError) {
          console.error('Error creating recipe ingredients:', ingredientsError)
          throw ingredientsError
        }
        
        console.log('Successfully saved recipe ingredients:', ingredientsResult)
      }
      
      return { 
        success: true, 
        data: { 
          recipe_id: recipeId,
          recipe_name: recipeData.name,
          ingredients_count: recipeIngredients.length
        }
      }
      
    } catch (error) {
      console.error('Error saving recipe with ingredients:', error)
      return { success: false, error: error.message }
    }
  },

  // Get recipes by restaurant
  async getRecipesByRestaurant(restaurantId) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            amount_needed,
            ingredients (
              ingredient_name,
              category,
              is_allergic,
              can_be_frozen,
              shelf_life_days
            )
          )
        `)
        .eq('restaurant_id', restaurantId)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching recipes:', error)
      return { success: false, error: error.message }
    }
  }
}

// Storage Service (Daily Imports)
export const storageService = {
  // Save daily import data to storage table
  async saveDailyImport(restaurantId, importData) {
    try {
      console.log('Starting daily import save process...')
      console.log('Restaurant ID:', restaurantId)
      console.log('Import data:', importData)
      
      // Try Supabase first, fallback to localStorage if it fails
      try {
        // Test Supabase connection first
        const { data: testData, error: testError } = await supabase
          .from('ingredients')
          .select('count')
          .limit(1)
        
        if (testError) {
          throw new Error(`Supabase connection failed: ${testError.message}`)
        }
        
        console.log('Supabase connection test passed')
        
        // Ensure restaurant exists (create if needed)
        const actualRestaurantId = await this.ensureRestaurantExists(restaurantId)
        console.log('Using restaurant ID:', actualRestaurantId)
        
        const storageEntries = []
        
        // Convert import data to storage entries
        for (const [category, items] of Object.entries(importData.importData)) {
          for (const [itemName, amount] of Object.entries(items)) {
            console.log(`Processing: ${itemName} (${amount} lbs) in ${category}`)
            
            // Find existing ingredient
            const ingredientResult = await ingredientsService.findIngredientByName(itemName)
            
            if (ingredientResult.success) {
              storageEntries.push({
                restaurant_id: actualRestaurantId,
                ingredient_id: ingredientResult.data.ingredient_id,
                weight_lbs: amount,
                import_date: importData.date
              })
              console.log(`Created storage entry for ${itemName} (ID: ${ingredientResult.data.ingredient_id})`)
            } else {
              console.error(`Failed to find ingredient for ${itemName}:`, ingredientResult.error)
              // Still create storage entry with a fallback approach
              console.log(`Attempting to find ingredient by category: ${category}`)
              const categoryResult = await ingredientsService.getIngredientsByCategory(category)
              if (categoryResult.success && categoryResult.data.length > 0) {
                // Use first ingredient from category as fallback
                const fallbackIngredient = categoryResult.data[0]
                storageEntries.push({
                  restaurant_id: actualRestaurantId,
                  ingredient_id: fallbackIngredient.ingredient_id,
                  weight_lbs: amount,
                  import_date: importData.date
                })
                console.log(`Used fallback ingredient ${fallbackIngredient.ingredient_name} for ${itemName}`)
              }
            }
          }
        }

        console.log('Storage entries to insert:', storageEntries)

        // Insert storage entries
        const { data: result, error } = await supabase
          .from('storage')
          .insert(storageEntries)
          .select()

        if (error) {
          console.error('Supabase insert error:', error)
          throw error
        }
        
        console.log('Successfully saved to storage table:', result)
        return { success: true, data: result, source: 'supabase' }
        
      } catch (supabaseError) {
        console.warn('Supabase failed, falling back to localStorage:', supabaseError.message)
        
        // Fallback to localStorage
        const localStorageKey = `daily_imports_${importData.date}`
        const existingData = JSON.parse(localStorage.getItem(localStorageKey) || '[]')
        
        const newEntry = {
          id: Date.now(),
          restaurant_id: restaurantId,
          date: importData.date,
          timestamp: importData.timestamp,
          importData: importData.importData,
          totalImports: importData.totalImports,
          categories: importData.categories,
          saved_at: new Date().toISOString(),
          source: 'localStorage'
        }
        
        existingData.push(newEntry)
        localStorage.setItem(localStorageKey, JSON.stringify(existingData))
        
        console.log('Successfully saved to localStorage:', newEntry)
        return { 
          success: true, 
          data: newEntry, 
          source: 'localStorage',
          message: 'Data saved locally (Supabase unavailable)'
        }
      }
      
    } catch (error) {
      console.error('Error saving daily import:', error)
      return { success: false, error: error.message || 'Unknown error occurred' }
    }
  },

  // Helper method to ensure restaurant exists
  async ensureRestaurantExists(restaurantId) {
    try {
      // Check if restaurant exists
      const { data: existing, error: checkError } = await supabase
        .from('restaurants')
        .select('restaurant_id')
        .eq('restaurant_id', restaurantId)
        .single()
      
      if (existing && !checkError) {
        console.log('Restaurant exists:', existing.restaurant_id)
        return existing.restaurant_id
      }
      
      // Create restaurant if it doesn't exist
      console.log('Creating restaurant with ID:', restaurantId)
      const { data: newRestaurant, error: createError } = await supabase
        .from('restaurants')
        .insert([{
          restaurant_id: restaurantId,
          restaurant_name: 'Demo Restaurant',
          address: '123 Demo Street, Demo City',
          phone_number: '555-0123',
          email: 'demo@restaurant.com'
        }])
        .select()
      
      if (createError) {
        console.error('Error creating restaurant:', createError)
        throw createError
      }
      
      console.log('Restaurant created:', newRestaurant[0].restaurant_id)
      return newRestaurant[0].restaurant_id
    } catch (error) {
      console.error('Error ensuring restaurant exists:', error)
      throw error
    }
  },

  // Get storage by restaurant
  async getStorageByRestaurant(restaurantId) {
    try {
      const { data, error } = await supabase
        .from('storage')
        .select(`
          *,
          ingredients (
            ingredient_name,
            category,
            is_allergic,
            can_be_frozen,
            shelf_life_days
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('import_date', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching storage:', error)
      return { success: false, error: error.message }
    }
  }
}

// Waste Service (Food Leftovers)
export const wasteService = {
  // Save food leftover data to waste table
  async saveFoodLeftover(restaurantId, leftoverData) {
    try {
      console.log('Starting food leftover save process...')
      console.log('Restaurant ID:', restaurantId)
      console.log('Leftover data:', leftoverData)
      
      // Try Supabase first, fallback to localStorage if it fails
      try {
        const wasteEntries = []
        
        // Convert leftover data to waste entries
        for (const [category, items] of Object.entries(leftoverData.leftoverData)) {
          for (const [itemName, itemData] of Object.entries(items)) {
            console.log(`Processing leftover: ${itemName} (${itemData.amount} lbs) in ${category}`)
            
            // First, find or create recipe
            const recipeResult = await recipeService.createRecipe(restaurantId, {
              name: itemName
            })
            
            if (recipeResult.success) {
              wasteEntries.push({
                restaurant_id: restaurantId,
                recipe_id: recipeResult.data.recipe_id,
                servings_wasted: Math.ceil(itemData.amount), // Convert lbs to servings
                waste_date: leftoverData.date,
                is_claimed: false
              })
              console.log(`Created waste entry for ${itemName}`)
            } else {
              console.error(`Failed to create recipe for ${itemName}:`, recipeResult.error)
            }
          }
        }

        console.log('Waste entries to insert:', wasteEntries)

        // Insert waste entries
        const { data: result, error } = await supabase
          .from('waste')
          .insert(wasteEntries)
          .select()

        if (error) {
          console.error('Supabase insert error:', error)
          throw error
        }
        
        console.log('Successfully saved to waste table:', result)
        return { success: true, data: result, source: 'supabase' }
        
      } catch (supabaseError) {
        console.warn('Supabase failed, falling back to localStorage:', supabaseError.message)
        
        // Fallback to localStorage
        const localStorageKey = `food_leftovers_${leftoverData.date}`
        const existingData = JSON.parse(localStorage.getItem(localStorageKey) || '[]')
        
        const newEntry = {
          id: Date.now(),
          restaurant_id: restaurantId,
          date: leftoverData.date,
          timestamp: leftoverData.timestamp,
          leftoverData: leftoverData.leftoverData,
          totalLeftovers: leftoverData.totalLeftovers,
          saved_at: new Date().toISOString(),
          source: 'localStorage'
        }
        
        existingData.push(newEntry)
        localStorage.setItem(localStorageKey, JSON.stringify(existingData))
        
        console.log('Successfully saved to localStorage:', newEntry)
        return { 
          success: true, 
          data: newEntry, 
          source: 'localStorage',
          message: 'Data saved locally (Supabase unavailable)'
        }
      }
      
    } catch (error) {
      console.error('Error saving food leftover:', error)
      return { success: false, error: error.message || 'Unknown error occurred' }
    }
  },

  // Save multiple waste entries (replaces today's data)
  async saveWasteEntries(wasteEntriesArray) {
    try {
      console.log('Saving multiple waste entries:', wasteEntriesArray)
      
      if (wasteEntriesArray.length === 0) {
        return { success: true, data: [] }
      }
      
      // First, delete existing waste entries for today for this restaurant
      const today = new Date().toISOString().split('T')[0];
      const restaurantId = wasteEntriesArray[0].restaurant_id;
      
      const { error: deleteError } = await supabase
        .from('waste')
        .delete()
        .eq('restaurant_id', restaurantId)
        .eq('waste_date', today);

      if (deleteError) {
        console.error('Error deleting existing waste entries:', deleteError)
        throw deleteError
      }
      
      console.log('Deleted existing waste entries for today')
      
      // Then insert all new waste entries
      const { data: result, error } = await supabase
        .from('waste')
        .insert(wasteEntriesArray)
        .select()

      if (error) {
        console.error('Error saving waste entries:', error)
        throw error
      }
      
      console.log('Successfully saved waste entries:', result)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error saving waste entries:', error)
      return { success: false, error: error.message }
    }
  },

  // Save individual waste entry (replaces today's data)
  async saveWasteEntry(wasteData) {
    try {
      console.log('Saving waste entry:', wasteData)
      
      // First, delete existing waste entries for today for this restaurant
      const today = new Date().toISOString().split('T')[0];
      const { error: deleteError } = await supabase
        .from('waste')
        .delete()
        .eq('restaurant_id', wasteData.restaurant_id)
        .eq('waste_date', today);

      if (deleteError) {
        console.error('Error deleting existing waste entries:', deleteError)
        throw deleteError
      }
      
      console.log('Deleted existing waste entries for today')
      
      // Then insert the new waste entry
      const { data: result, error } = await supabase
        .from('waste')
        .insert([wasteData])
        .select()

      if (error) {
        console.error('Error saving waste entry:', error)
        throw error
      }
      
      console.log('Successfully saved waste entry:', result[0])
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Error saving waste entry:', error)
      return { success: false, error: error.message }
    }
  },

  // Get waste by restaurant
  async getWasteByRestaurant(restaurantId) {
    try {
      const { data, error } = await supabase
        .from('waste')
        .select(`
          *,
          recipes (
            recipe_name
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_claimed', false)
        .order('waste_date', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching waste:', error)
      return { success: false, error: error.message }
    }
  }
}

// Ingredients Service
export const ingredientsService = {
  // Get all ingredients
  async getAllIngredients() {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('ingredient_name')

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching ingredients:', error)
      return { success: false, error: error.message }
    }
  },

  // Find ingredient by name (since ingredients table is now populated)
  async findIngredientByName(ingredientName) {
    try {
      console.log('Finding ingredient:', ingredientName)
      
      const { data: existing, error: searchError } = await supabase
        .from('ingredients')
        .select('*')
        .ilike('ingredient_name', `%${ingredientName}%`)
        .limit(1)
      
      if (searchError) {
        console.error('Error searching for ingredient:', searchError)
        return { success: false, error: searchError.message }
      }
      
      if (existing && existing.length > 0) {
        console.log('Found ingredient:', existing[0])
        return { success: true, data: existing[0] }
      }
      
      // If not found, try exact match
      const { data: exactMatch, error: exactError } = await supabase
        .from('ingredients')
        .select('*')
        .eq('ingredient_name', ingredientName)
        .single()
      
      if (exactMatch && !exactError) {
        console.log('Found exact ingredient:', exactMatch)
        return { success: true, data: exactMatch }
      }
      
      console.log('Ingredient not found:', ingredientName)
      return { success: false, error: 'Ingredient not found' }
    } catch (error) {
      console.error('Error finding ingredient:', error)
      return { success: false, error: error.message || 'Unknown error occurred' }
    }
  },

  // Get ingredients by category
  async getIngredientsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('category', category)
        .order('ingredient_name')

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching ingredients by category:', error)
      return { success: false, error: error.message }
    }
  },

  // Search ingredients (for autocomplete)
  async searchIngredients(query) {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .ilike('ingredient_name', `%${query}%`)
        .order('ingredient_name')
        .limit(10)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error searching ingredients:', error)
      return { success: false, error: error.message }
    }
  }
}

// Pickup Service (for pickup organizations)
export const pickupService = {
  // Create pickup organization profile
  async createPickupProfile(pickupData) {
    try {
      console.log('Creating pickup profile:', pickupData)
      
      // First check if pickup already exists
      const existingPickup = await this.getPickupById(pickupData.pickup_id)
      if (existingPickup.success) {
        console.log('Pickup profile already exists, returning existing data')
        return { success: true, data: existingPickup.data }
      }
      
      const { data: result, error } = await supabase
        .from('pickups')
        .insert([pickupData])
        .select()
        .single()

      if (error) {
        console.error('Error creating pickup profile:', error)
        // If it's a duplicate key error, try to fetch the existing record
        if (error.code === '23505') { // PostgreSQL unique violation error code
          console.log('Duplicate key detected, fetching existing pickup profile')
          const existingPickup = await this.getPickupById(pickupData.pickup_id)
          if (existingPickup.success) {
            return { success: true, data: existingPickup.data }
          }
        }
        throw error
      }
      
      console.log('Successfully created pickup profile:', result)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error creating pickup profile:', error)
      return { success: false, error: error.message }
    }
  },

  // Get pickup profile by ID
  async getPickupById(pickupId) {
    try {
      const { data, error } = await supabase
        .from('pickups')
        .select('*')
        .eq('pickup_id', pickupId)
        .maybeSingle() // Use maybeSingle() instead of single() to handle no results gracefully

      if (error) {
        console.error('Error fetching pickup profile:', error)
        throw error
      }
      
      // If no data found, return success: false (not an error, just doesn't exist)
      if (!data) {
        return { success: false, error: 'Pickup profile not found' }
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching pickup profile:', error)
      return { success: false, error: error.message }
    }
  },

  // Get all restaurants with their waste data
  async getRestaurantsWithWaste() {
    try {
      const { data: restaurants, error: restaurantError } = await supabase
        .from('restaurants')
        .select(`
          *,
          waste:waste(
            *,
            recipes:recipes(*)
          )
        `)

      if (restaurantError) {
        console.error('Error fetching restaurants:', restaurantError)
        throw restaurantError
      }

      // Filter out restaurants with no waste data
      const restaurantsWithWaste = restaurants.filter(restaurant => 
        restaurant.waste && restaurant.waste.length > 0
      )

      return { success: true, data: restaurantsWithWaste }
    } catch (error) {
      console.error('Error fetching restaurants with waste:', error)
      return { success: false, error: error.message }
    }
  }
}

// Order Service (for managing pickup requests)
export const orderService = {
  // Create a pickup order
  async createOrder(orderData) {
    try {
      console.log('Creating pickup order:', orderData)
      
      const { data: result, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (error) {
        console.error('Error creating order:', error)
        throw error
      }
      
      console.log('Successfully created order:', result)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error creating order:', error)
      return { success: false, error: error.message }
    }
  },

  // Get orders for a restaurant
  async getOrdersByRestaurant(restaurantId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          pickups:pickups(*),
          order_items:order_items(
            *,
            waste:waste(*)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        throw error
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching orders:', error)
      return { success: false, error: error.message }
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .select()
        .single()

      if (error) {
        console.error('Error updating order status:', error)
        throw error
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Error updating order status:', error)
      return { success: false, error: error.message }
    }
  }
}

// Legacy service names for backward compatibility
export const dailyImportService = storageService
export const foodLeftoverService = wasteService
