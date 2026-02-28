import { createClient } from '@supabase/supabase-js'

// 1. Go to your Supabase Dashboard -> Settings (Gear Icon) -> API
// 2. Copy "Project URL" and paste it below
const supabaseUrl = 'https://pbwgghzphsqmubuscpoi.supabase.co'

// 3. Copy "Project API Key" (anon public) and paste it below
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBid2dnaHpwaHNxbXVidXNjcG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjUyMzQsImV4cCI6MjA4NDYwMTIzNH0.GKKG5ylVH-pHe2Uu3A4Oc8sbwyoWWOpKPG4fvFyWA5Q'

export const supabase = createClient(supabaseUrl, supabaseKey)