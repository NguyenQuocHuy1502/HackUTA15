import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wfjizfxcijqnvdqfrcyg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmaml6ZnhjaWpxbnZkcWZyY3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTEwNDMsImV4cCI6MjA3NTE4NzA0M30.2IzRLhJxABsOcI97VkXjFmaJGClxOaX_toVwbfXnRX0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
