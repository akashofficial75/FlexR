import { createClient } from '@supabase/supabase-js';

// Get raw environment variables
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validation and sanitization function
function sanitizeSupabaseUrl(url: string): string {
  if (!url) return '';
  try {
    let urlString = url.trim();
    if (!urlString.startsWith('http')) {
      urlString = 'https://' + urlString;
    }
    const parsedUrl = new URL(urlString);
    // Supabase project URL should be just the origin (e.g., https://xxxxx.supabase.co)
    // This strips out accidental paths like /rest/v1 or /auth/v1
    return parsedUrl.origin;
  } catch (err) {
    console.error('Invalid Supabase URL format:', url);
    return '';
  }
}

const supabaseUrl = sanitizeSupabaseUrl(rawSupabaseUrl);
const supabaseAnonKey = rawSupabaseAnonKey.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  // Create a dummy client to prevent runtime errors when destructuring if unconfigured
  : ({
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ error: new Error('Supabase is not configured properly. Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.') }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Supabase not configured') }),
            order: async () => ({ data: [], error: new Error('Supabase not configured') })
          }),
          order: async () => ({ data: [], error: new Error('Supabase not configured') })
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: new Error('Supabase not configured') })
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: new Error('Supabase not configured') })
            })
          })
        }),
        delete: () => ({
          eq: async () => ({ error: new Error('Supabase not configured') })
        })
      }),
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
          remove: async () => ({ data: null, error: new Error('Supabase not configured') })
        })
      }
    } as any);
