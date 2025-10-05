# Feco Food Waste Tracking App - Updated Supabase Integration

## Overview

Your Feco app now integrates with your existing Supabase database schema, which is designed for a comprehensive restaurant-to-charity food waste management system. The app maps to your existing tables and follows the proper workflow.

## Your Existing Database Schema

Your Supabase database includes these tables:
- `restaurants` - Restaurant profiles and information
- `recipes` - Restaurant-specific recipes
- `ingredients` - Master ingredient list with properties
- `recipe_ingredients` - Links recipes to ingredients with amounts
- `storage` - Daily ingredient imports/inventory
- `waste` - Food waste/leftovers available for pickup
- `pickups` - Charity/food bank profiles
- `orders` - Pickup requests and status tracking
- `order_items` - Links orders to specific waste items

## How the App Maps to Your Schema

### 1. Daily Import Form → `storage` Table
When restaurants submit daily imports:
- **Input**: Food items by category (Meat, Dairy, etc.) with weights
- **Process**: Creates entries in `ingredients` table (if new) and `storage` table
- **Output**: Inventory tracking for restaurants

### 2. Food Leftover Form → `waste` Table
When restaurants report leftovers:
- **Input**: Leftover food items with amounts and reasons
- **Process**: Creates entries in `recipes` table (if new) and `waste` table
- **Output**: Available waste items for charities to claim

## Data Flow in Your System

### Restaurant Side (Current App)
1. **Setup**: Restaurant creates profile in `restaurants` table
2. **Recipe Building**: Creates recipes in `recipes` table with ingredients
3. **Daily Imports**: Logs incoming ingredients in `storage` table
4. **Waste Reporting**: Reports leftover food in `waste` table

### Charity Side (Future Feature)
1. **Setup**: Charity creates profile in `pickups` table
2. **Browse Waste**: Views available waste from `waste` table
3. **Request Pickup**: Creates order in `orders` table
4. **Confirmation**: Restaurant approves/denies in `orders` table

## Current Implementation

### Services Created
- `restaurantService` - Restaurant management
- `recipeService` - Recipe creation and management
- `storageService` - Daily import data (maps to `storage` table)
- `wasteService` - Food leftover data (maps to `waste` table)
- `ingredientsService` - Ingredient management

### Form Integration
- **Daily Import Form**: Saves to `storage` table via `storageService`
- **Food Leftover Form**: Saves to `waste` table via `wasteService`
- **Automatic Ingredient/Recipe Creation**: Creates entries as needed

## Data Examples

### Daily Import → Storage Entry
```javascript
// User Input
{
  "Meat": { "Chicken": 5.5, "Beef": 3.2 },
  "Dairy": { "Milk": 2.0 }
}

// Creates in ingredients table
{ ingredient_id: 1, ingredient_name: "Chicken", category: "Meat" }
{ ingredient_id: 2, ingredient_name: "Beef", category: "Meat" }
{ ingredient_id: 3, ingredient_name: "Milk", category: "Dairy" }

// Creates in storage table
{ restaurant_id: "uuid", ingredient_id: 1, weight_lbs: 5.5, import_date: "2025-01-04" }
{ restaurant_id: "uuid", ingredient_id: 2, weight_lbs: 3.2, import_date: "2025-01-04" }
{ restaurant_id: "uuid", ingredient_id: 3, weight_lbs: 2.0, import_date: "2025-01-04" }
```

### Food Leftover → Waste Entry
```javascript
// User Input
{
  "Main Dishes": { "Pizza": { amount: 2.5, reason: "overcooked" } }
}

// Creates in recipes table
{ recipe_id: "uuid", restaurant_id: "uuid", recipe_name: "Pizza" }

// Creates in waste table
{ restaurant_id: "uuid", recipe_id: "uuid", servings_wasted: 3, waste_date: "2025-01-04", is_claimed: false }
```

## Current Limitations & Next Steps

### Current State
- ✅ Forms save to correct tables
- ✅ Automatic ingredient/recipe creation
- ✅ Proper foreign key relationships
- ⚠️ Uses placeholder restaurant ID

### Next Steps for Full Integration

#### 1. Restaurant Authentication
```javascript
// Replace placeholder with real restaurant ID
const restaurantId = user.restaurant_id; // From Auth0 user metadata
```

#### 2. Add Restaurant Registration
- Create restaurant profile during signup
- Link Auth0 user to restaurant record
- Store restaurant_id in user session

#### 3. Add Charity Interface
- Create charity/pickup user interface
- Browse available waste items
- Request pickups and track orders

#### 4. Add Order Management
- Restaurant approval/denial system
- Order status tracking
- Pickup completion workflow

## Testing the Current Integration

### 1. Test Daily Import
1. Go to Forms → Daily Import
2. Add food items and amounts
3. Click "Save to Supabase"
4. Check Supabase Dashboard → `storage` table

### 2. Test Food Leftover
1. Go to Forms → Food Leftovers
2. Add leftover items with reasons
3. Click "Save to Supabase"
4. Check Supabase Dashboard → `waste` table

### 3. Verify Data
- Check `ingredients` table for new ingredients
- Check `recipes` table for new recipes
- Verify foreign key relationships

## Benefits of Your Schema

✅ **Scalable**: Handles multiple restaurants and charities
✅ **Relational**: Proper foreign key relationships
✅ **Comprehensive**: Full workflow from import to pickup
✅ **Extensible**: Easy to add new features
✅ **Professional**: Production-ready database design

## Files Updated

- `src/lib/supabaseService.js` - Updated to use your schema
- `src/components/FoodWasteForm.jsx` - Maps to `storage` table
- `src/components/FoodLeftoverForm.jsx` - Maps to `waste` table
- `src/lib/supabase.js` - Your Supabase configuration

Your app now properly integrates with your existing Supabase schema and follows the restaurant-to-charity workflow! 🎉
