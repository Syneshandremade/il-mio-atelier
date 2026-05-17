import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://zxnufwyjgisvmyipnwls.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4bnVmd3lqZ2lzdm15aXBud2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDU1MzksImV4cCI6MjA5NDU4MTUzOX0.6A-o82dc_qLKQqOyRSZTn35er0FKoSxNuizpR_sRz2E'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
