// This file is deprecated - using Supabase instead
// See lib/supabase.ts for the database and authentication configuration

console.warn('firebase.ts is deprecated. Using Supabase instead.')

// Export empty stubs to avoid import errors in other modules
const app = {} as any
const auth = {} as any
const db = {} as any
const analytics: any = null

export { app, auth, db, analytics }
