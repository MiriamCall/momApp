// src/pages/api/auth/signout.ts
// With `output: 'static'` configured:
// export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase"; // Import your Supabase client

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Invalidate the session on the Supabase backend
  // This is crucial for a complete sign-out, as it revokes the tokens server-side.
  const { error } = await supabase.auth.signOut();

  if (error) {
    // Log any errors that occur during Supabase sign out.
    // In a production app, you might want more robust error handling or user feedback.
    console.error("Error signing out from Supabase:", error.message);
  }

  // Delete the client-side cookies that store the access and refresh tokens.
  // Ensure the 'path', 'secure', and 'sameSite' attributes match how they were set
  // in signin.ts to guarantee removal.
  cookies.delete("sb-access-token", {
    path: "/",
    secure: true,
    sameSite: "lax",
  });
  cookies.delete("sb-refresh-token", {
    path: "/",
    secure: true,
    sameSite: "lax",
  });

  // Explicitly delete the internal Supabase client storage cookies.
  // These cookies often have dynamic names based on your Supabase project.
  // The names provided in your output indicate they might be fragmented.
  // We are targeting them directly based on your provided cookie names.
  cookies.delete("sb-nbjicydejhujbharetbk-auth-token.0", {
    path: "/",
    secure: true,
    sameSite: "lax",
  });
  cookies.delete("sb-nbjicydejhujbharetbk-auth-token.1", {
    path: "/",
    secure: true,
    sameSite: "lax",
  });

  // Redirect the user to the sign-in page after signing out.
  return redirect("/signin");
};
