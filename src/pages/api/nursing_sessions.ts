// // src/pages/api/nursing_sessions.ts

// import type { APIRoute } from "astro";
// import { supabase } from "../../lib/supabase"; // Ensure this path is correct for your server-side Supabase client

// // Helper function to authenticate the Supabase client with the user's access token
// async function getAuthenticatedSupabaseClient(cookies: Astro.Cookies) {
//   const accessToken = cookies.get("sb-access-token")?.value;
//   if (!accessToken) {
//     return {
//       client: null,
//       user: null,
//       error: new Error("Unauthorized: No access token"),
//     };
//   }

//   // Set the access token for the Supabase client instance
//   const supa = supabase.auth.setAuth(accessToken);

//   // Get the user associated with the token
//   const {
//     data: { user },
//     error: userError,
//   } = await supa.auth.getUser();

//   if (userError || !user) {
//     return {
//       client: null,
//       user: null,
//       error: userError || new Error("Unauthorized: Invalid user session"),
//     };
//   }

//   return { client: supa, user, error: null };
// }

// // --- GET (READ) Nursing Sessions ---
// export const GET: APIRoute = async ({ cookies }) => {
//   const {
//     client: supa,
//     user,
//     error: authError,
//   } = await getAuthenticatedSupabaseClient(cookies);

//   if (authError) {
//     console.error("GET API Auth Error:", authError.message);
//     return new Response(authError.message, { status: 401 });
//   }

//   // Fetch nursing sessions for the authenticated user, ordered by newest first
//   const { data, error } = await supa
//     .from("nursing_sessions")
//     .select("*")
//     .eq("user_id", user.id) // RLS ensures this is enforced, but good to include for clarity
//     .order("start_time", { ascending: false });

//   if (error) {
//     console.error("GET API Supabase Error:", error.message);
//     return new Response(error.message, { status: 500 });
//   }

//   return new Response(JSON.stringify(data), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
// };

// // --- POST (CREATE) Nursing Session ---
// export const POST: APIRoute = async ({ request, cookies }) => {
//   const {
//     client: supa,
//     user,
//     error: authError,
//   } = await getAuthenticatedSupabaseClient(cookies);

//   if (authError) {
//     console.error("POST API Auth Error:", authError.message);
//     return new Response(authError.message, { status: 401 });
//   }

//   const body = await request.json();
//   const { start_time, end_time, nursing_side, duration_seconds } = body;

//   // Basic validation for required fields
//   if (!start_time || !nursing_side) {
//     return new Response(
//       "Missing required fields: start_time and nursing_side",
//       { status: 400 }
//     );
//   }

//   // Insert new nursing session record
//   const { data, error } = await supa
//     .from("nursing_sessions")
//     .insert([
//       {
//         user_id: user.id, // Link to the authenticated user
//         start_time,
//         end_time: end_time || null, // Allow end_time to be null for ongoing sessions
//         nursing_side,
//         duration_seconds: duration_seconds || null, // Allow duration_seconds to be null
//       },
//     ])
//     .select(); // Select the inserted record to return it

//   if (error) {
//     console.error("POST API Supabase Error:", error.message);
//     return new Response(error.message, { status: 500 });
//   }

//   return new Response(JSON.stringify(data[0]), {
//     // Return the first (and only) inserted record
//     status: 201,
//     headers: { "Content-Type": "application/json" },
//   });
// };

// // --- PUT (UPDATE) Nursing Session ---
// export const PUT: APIRoute = async ({ request, cookies }) => {
//   const {
//     client: supa,
//     user,
//     error: authError,
//   } = await getAuthenticatedSupabaseClient(cookies);

//   if (authError) {
//     console.error("PUT API Auth Error:", authError.message);
//     return new Response(authError.message, { status: 401 });
//   }

//   const body = await request.json();
//   const { id, start_time, end_time, nursing_side, duration_seconds } = body;

//   // Validate required fields for update
//   if (!id || !start_time || !nursing_side) {
//     return new Response(
//       "Missing required fields for update: id, start_time, nursing_side",
//       { status: 400 }
//     );
//   }

//   // Update the specified nursing session record
//   // RLS policy will ensure only the owner can update their own records
//   const { data, error } = await supa
//     .from("nursing_sessions")
//     .update({
//       start_time,
//       end_time: end_time || null,
//       nursing_side,
//       duration_seconds: duration_seconds || null,
//     })
//     .eq("id", id) // Match by session ID
//     .eq("user_id", user.id) // Double-check user_id for extra safety (RLS handles this too)
//     .select(); // Select the updated record to return it

//   if (error) {
//     console.error("PUT API Supabase Error:", error.message);
//     return new Response(error.message, { status: 500 });
//   }

//   if (!data || data.length === 0) {
//     // This could happen if the ID doesn't exist or the user doesn't own the record
//     return new Response("Session not found or not authorized to update.", {
//       status: 404,
//     });
//   }

//   return new Response(JSON.stringify(data[0]), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
// };

// // --- DELETE Nursing Session ---
// export const DELETE: APIRoute = async ({ request, cookies }) => {
//   const {
//     client: supa,
//     user,
//     error: authError,
//   } = await getAuthenticatedSupabaseClient(cookies);

//   if (authError) {
//     console.error("DELETE API Auth Error:", authError.message);
//     return new Response(authError.message, { status: 401 });
//   }

//   const body = await request.json(); // Expecting { id: "session-uuid" }
//   const { id } = body;

//   if (!id) {
//     return new Response("Missing session ID for deletion", { status: 400 });
//   }

//   // Delete the specified nursing session record
//   // RLS policy will ensure only the owner can delete their own records
//   const { error, count } = await supa
//     .from("nursing_sessions")
//     .delete()
//     .eq("id", id) // Match by session ID
//     .eq("user_id", user.id); // Double-check user_id for extra safety (RLS handles this too)

//   if (error) {
//     console.error("DELETE API Supabase Error:", error.message);
//     return new Response(error.message, { status: 500 });
//   }

//   if (count === 0) {
//     // If count is 0, it means no record was deleted (either not found or not owned by user)
//     return new Response("Session not found or not authorized to delete.", {
//       status: 404,
//     });
//   }

//   return new Response(
//     JSON.stringify({ message: "Session deleted successfully", id }),
//     {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     }
//   );
// };
