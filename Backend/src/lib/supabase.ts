import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Missing Supabase environment variables in backend')
}

// Service role key is used to bypass RLS in the backend
export const supabase = createClient(supabaseUrl || '', supabaseServiceRoleKey || '')
