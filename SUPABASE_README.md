# Feco Food Waste Tracking App - Supabase Integration

## Overview

This app now uses Supabase as the backend database to store all food waste tracking data in the cloud. Data is automatically saved to Supabase when users submit their daily imports and food leftovers.

## Supabase Setup

### 1. Database Configuration

Your Supabase project details:
- **Project URL**: `https://wfijizfxcijqnvdfqrcig.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmaml6ZnhjaWpxbnZkcWZyY3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTEwNDMsImV4cCI6MjA3NTE4NzA0M30.2IzRLhJxABsOcI97VkXjFmaJGClxOaX_toVwbfXnRX0`

### 2. Database Schema Setup

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run the SQL schema** from `supabase-schema.sql`

This will create:
- `daily_imports` table for storing daily food import data
- `food_leftovers` table for storing food leftover data
- Proper indexes and triggers
- Row Level Security policies

### 3. Tables Created

#### `daily_imports` Table
```sql
- id (BIGSERIAL PRIMARY KEY)
- date (DATE) - The date of the import
- timestamp (TIMESTAMPTZ) - When the data was submitted
- recipes (JSONB) - Array of recipes from onboarding
- import_data (JSONB) - Food items and amounts by category
- total_imports (DECIMAL) - Total weight imported
- categories (TEXT[]) - Array of food categories
- created_at (TIMESTAMPTZ) - Record creation time
- updated_at (TIMESTAMPTZ) - Last update time
```

#### `food_leftovers` Table
```sql
- id (BIGSERIAL PRIMARY KEY)
- date (DATE) - The date of the leftovers
- timestamp (TIMESTAMPTZ) - When the data was submitted
- leftover_data (JSONB) - Leftover items with amounts and reasons
- total_leftovers (DECIMAL) - Total weight of leftovers
- created_at (TIMESTAMPTZ) - Record creation time
- updated_at (TIMESTAMPTZ) - Last update time
```

## Frontend Integration

### 1. Supabase Client Setup

The app uses the Supabase client configured in `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wfijizfxcijqnvdfqrcig.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2. Service Layer

Data operations are handled through service functions in `src/lib/supabaseService.js`:

#### Daily Import Service
- `saveDailyImport(data)` - Save daily import data
- `getAllDailyImports()` - Get all daily imports
- `getDailyImportByDate(date)` - Get specific daily import
- `updateDailyImport(id, data)` - Update existing import
- `deleteDailyImport(id)` - Delete daily import

#### Food Leftover Service
- `saveFoodLeftover(data)` - Save leftover data
- `getAllFoodLeftovers()` - Get all leftover records

### 3. Form Integration

Both forms now save data to Supabase:

#### Daily Import Form
- **Button**: "Save to Supabase"
- **Data Saved**: Recipes, import data, totals, categories
- **Success Message**: Shows total weight and categories saved

#### Food Leftover Form
- **Button**: "Save to Supabase"
- **Data Saved**: Leftover items, amounts, reasons, totals
- **Success Message**: Shows total leftover weight saved

## Data Flow

### 1. User Submits Daily Import
```
User fills form → handleSubmitDailyImport() → dailyImportService.saveDailyImport() → Supabase API → Database
```

### 2. User Submits Food Leftovers
```
User fills form → handleSubmitLeftovers() → foodLeftoverService.saveFoodLeftover() → Supabase API → Database
```

## Data Examples

### Daily Import Data Structure
```json
{
  "date": "2025-01-04",
  "timestamp": "2025-01-04T23:34:37.562Z",
  "recipes": [
    {
      "name": "Chicken Salad",
      "ingredients": ["chicken", "lettuce", "tomato"]
    }
  ],
  "importData": {
    "Meat": {
      "Chicken": 5.5,
      "Beef": 3.2
    },
    "Dairy": {
      "Milk": 2.0
    }
  },
  "totalImports": 10.7,
  "categories": ["Meat", "Dairy", "Greens", "Carbohydrates"]
}
```

### Food Leftover Data Structure
```json
{
  "date": "2025-01-04",
  "timestamp": "2025-01-04T23:34:37.562Z",
  "leftoverData": {
    "Main Dishes": {
      "Pizza": {
        "amount": 2.5,
        "reason": "overcooked"
      }
    },
    "Sides": {
      "Fries": {
        "amount": 1.0,
        "reason": "expired"
      }
    }
  },
  "totalLeftovers": 3.5
}
```

## Security

- **Row Level Security (RLS)** is enabled on both tables
- **Policies** allow authenticated users to perform all operations
- **API Keys** are configured for public access (anon key)
- **Data validation** happens on both client and server side

## Benefits of Supabase Integration

✅ **Cloud Storage**: Data is stored in the cloud, accessible from anywhere
✅ **Real-time**: Supabase provides real-time subscriptions
✅ **Scalable**: Handles large amounts of data efficiently
✅ **Secure**: Built-in authentication and security features
✅ **API Ready**: RESTful API automatically generated
✅ **Dashboard**: Built-in admin dashboard for data management
✅ **Backup**: Automatic backups and data protection
✅ **Analytics**: Built-in analytics and monitoring

## Troubleshooting

### Common Issues

1. **"Failed to save data"**
   - Check internet connection
   - Verify Supabase project is active
   - Check browser console for detailed errors

2. **CORS Errors**
   - Supabase handles CORS automatically
   - Ensure you're using the correct project URL

3. **Authentication Errors**
   - Check if RLS policies are correctly configured
   - Verify API keys are correct

4. **Data Not Appearing**
   - Check Supabase dashboard for data
   - Verify table schema matches expected structure

### Development Tips

- Use Supabase Dashboard to view saved data
- Check browser Network tab for API calls
- Use Supabase SQL Editor for data queries
- Monitor Supabase logs for debugging

## Next Steps

1. **Set up the database schema** using the provided SQL
2. **Test the integration** by submitting forms
3. **View data** in Supabase Dashboard
4. **Add more features** like data visualization, reporting, etc.

The app is now fully integrated with Supabase and ready for production use! 🎉
