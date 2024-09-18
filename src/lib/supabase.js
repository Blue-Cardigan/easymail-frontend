import { createClient } from '@supabase/supabase-js'

const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!apiUrl || !apiKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(apiUrl, apiKey)
//Log when the supabase client is created successfully
if (supabase) {
  console.log('Supabase client created successfully')
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)
  // You can add more error handling logic here
  throw error
}