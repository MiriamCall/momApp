// src/lib/supabaseServer.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { AstroGlobal } from "astro"; // Import AstroGlobal for type-safety when passing 'Astro'

/**
 * Creates a Supabase client for server-side operations (SSR, API routes) in Astro.
 * This client properly handles reading and setting session cookies from the Astro.cookies object.
 *
 * @param astro A reference to the Astro global object (Astro context).
 * @returns A Supabase client instance.
 */
export const getSupabase = (astro: AstroGlobal) => {
  // Type as AstroGlobal for clarity
  return createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return astro.cookies.get(name)?.value; // Access cookies via astro.cookies
        },
        set(name: string, value: string, options: CookieOptions) {
          // Astro's cookies.set method directly accepts the options.
          // Ensure correct path and secure flags for production.
          astro.cookies.set(name, value, {
            ...options,
            path: "/", // Ensure cookie is set for the entire site
            httpOnly: true, // Recommended for security
            secure: import.meta.env.PROD, // Use secure cookies in production (HTTPS)
            sameSite: "lax", // Or 'strict', depending on your needs
          });
        },
        remove(name: string, options: CookieOptions) {
          // Astro's cookies.delete method also accepts options, good for consistency.
          astro.cookies.delete(name, {
            ...options,
            path: "/", // Ensure removal from the entire site path
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: "lax",
          });
        },
      },
    }
  );
};
