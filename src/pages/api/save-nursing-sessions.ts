// // src/pages/api/save-nursing-session.ts
// import type { APIRoute } from "astro";
// import { getSupabase } from "../../lib/supabaseServer";

// export const POST: APIRoute = async ({ request, cookies }) => {
//   try {
//     const body = await request.json();
//     const { start_time, end_time, duration_seconds, nursing_side } = body;

//     // Validate required fields
//     if (!start_time || !end_time || !duration_seconds || !nursing_side) {
//       return new Response(
//         JSON.stringify({ error: "Missing required fields" }),
//         {
//           status: 400,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }

//     // Get Supabase client with server-side context
//     // Pass the entire context object that includes cookies
//     const supabase = getSupabase({ request, cookies });

//     // Get the current session
//     const {
//       data: { session },
//       error: sessionError,
//     } = await supabase.auth.getSession();

//     if (sessionError || !session) {
//       console.error("Session error:", sessionError);
//       return new Response(
//         JSON.stringify({ error: "Unauthorized - no valid session" }),
//         {
//           status: 401,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }

//     console.log("Server-side auth successful, user ID:", session.user.id);

//     // Insert the nursing session
//     const { data, error } = await supabase.from("nursing_sessions").insert([
//       {
//         user_id: session.user.id,
//         start_time,
//         end_time,
//         duration_seconds,
//         nursing_side,
//       },
//     ]);

//     if (error) {
//       console.error("Database error:", error);
//       return new Response(JSON.stringify({ error: error.message }), {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     return new Response(JSON.stringify({ success: true, data }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("API error:", error);
//     return new Response(JSON.stringify({ error: "Internal server error" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// };
