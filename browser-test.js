// Browser Supabase Test
// Add this to your browser console at http://localhost:5173/

async function testSupabaseInBrowser() {
  console.log('🧪 Testing Supabase in browser...')
  
  try {
    // Import Supabase (this should work in browser)
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js')
    
    const supabaseUrl = 'https://wfjizfxcijqnvdqfrcyg.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmaml6ZnhjaWpxbnZkcWZyY3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTEwNDMsImV4cCI6MjA3NTE4NzA0M30.2IzRLhJxABsOcI97VkXjFmaJGClxOaX_toVwbfXnRX0'
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    console.log('Testing connection...')
    const { data, error } = await supabase
      .from('ingredients')
      .select('ingredient_name')
      .limit(3)
    
    if (error) {
      console.log('❌ Browser Supabase error:', error)
    } else {
      console.log('✅ Browser Supabase works!', data)
    }
  } catch (error) {
    console.log('❌ Browser test failed:', error)
  }
}

// Run the test
testSupabaseInBrowser()
