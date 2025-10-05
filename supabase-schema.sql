-- Supabase Database Schema for Feco Food Waste Tracking App
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create daily_imports table
CREATE TABLE IF NOT EXISTS daily_imports (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    recipes JSONB NOT NULL DEFAULT '[]',
    import_data JSONB NOT NULL DEFAULT '{}',
    total_imports DECIMAL(10,2) NOT NULL DEFAULT 0,
    categories TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create food_leftovers table
CREATE TABLE IF NOT EXISTS food_leftovers (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    leftover_data JSONB NOT NULL DEFAULT '{}',
    total_leftovers DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_imports_date ON daily_imports(date);
CREATE INDEX IF NOT EXISTS idx_daily_imports_created_at ON daily_imports(created_at);
CREATE INDEX IF NOT EXISTS idx_food_leftovers_date ON food_leftovers(date);
CREATE INDEX IF NOT EXISTS idx_food_leftovers_created_at ON food_leftovers(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE daily_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_leftovers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these based on your needs)
-- For now, allowing all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON daily_imports
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON food_leftovers
    FOR ALL USING (auth.role() = 'authenticated');

-- Alternative: Allow public access (for development/testing)
-- Uncomment these if you want to allow public access
-- CREATE POLICY "Allow public access" ON daily_imports FOR ALL USING (true);
-- CREATE POLICY "Allow public access" ON food_leftovers FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_daily_imports_updated_at 
    BEFORE UPDATE ON daily_imports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_leftovers_updated_at 
    BEFORE UPDATE ON food_leftovers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
-- INSERT INTO daily_imports (date, timestamp, recipes, import_data, total_imports, categories) VALUES
-- ('2025-01-04', NOW(), '[{"name": "Chicken Salad", "ingredients": ["chicken", "lettuce", "tomato"]}]', '{"Meat": {"Chicken": 5.5}, "Dairy": {"Milk": 2.0}}', 7.5, ARRAY['Meat', 'Dairy']);

-- INSERT INTO food_leftovers (date, timestamp, leftover_data, total_leftovers) VALUES
-- ('2025-01-04', NOW(), '{"Main Dishes": {"Pizza": {"amount": 2.5, "reason": "overcooked"}}}', 2.5);
