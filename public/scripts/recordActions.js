// public/scripts/recordActions.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let supabaseClient = null;

/**
 * Initializes the Supabase client with the provided access token.
 * This ensures all subsequent database operations are authenticated.
 * @param {string} accessToken - The user's access token.
 * @returns {object} The Supabase client instance.
 */
export function initializeSupabaseClient(accessToken) {
  if (!supabaseClient) {
    // Replace with your actual Supabase URL and PUBLIC_SUPABASE_ANON_KEY
    // The PUBLIC_SUPABASE_ANON_KEY is safe to expose in client-side code.
    // The accessToken handles the user-specific authorization.
    supabaseClient = createClient(
      "https://nbjicydejhujbharetbk.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iamljeWRlamh1amJoYXJldGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Mzk0OTQsImV4cCI6MjA2NzMxNTQ5NH0.ew6OfER-EfHZJbfb5cchQ3CNqxyEHmI08g5R0bkMyOM",
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Crucial for RLS
          },
        },
      }
    );
    console.log(
      "Supabase client initialized in recordActions.js with access token."
    );
  }
  return supabaseClient;
}

/**
 * Updates a nursing session record in the database.
 * @param {string} sessionId - The ID of the session to update.
 * @param {number} newDurationSeconds - The new duration in seconds.
 * @param {string} nursingSide - The nursing side ('left' or 'right').
 * @param {string} startTime - The start time in ISO string format.
 * @param {string} userId - The ID of the user who owns the record.
 * @param {string} accessToken - The user's access token for authentication.
 * @returns {Promise<{success: boolean, message: string}>} Result of the operation.
 */
export async function updateRecord(
  sessionId,
  newDurationSeconds,
  nursingSide,
  startTime,
  userId,
  accessToken
) {
  const client = initializeSupabaseClient(accessToken);

  console.log("Attempting to update session from recordActions.js:");
  console.log("Session ID:", sessionId);
  console.log("User ID:", userId);
  console.log("New Duration (seconds):", newDurationSeconds);
  console.log("Nursing Side:", nursingSide);
  console.log("Start Time:", startTime);

  try {
    const { data, error, count } = await client
      .from("nursing_sessions")
      .update({
        duration_seconds: newDurationSeconds,
        nursing_side: nursingSide,
        start_time: startTime,
      })
      .eq("id", sessionId)
      .eq("user_id", userId) // Ensure RLS is satisfied
      .select(); // Request the updated data back to confirm success

    if (error) {
      console.error(
        "Supabase Error updating session (recordActions.js):",
        error.message
      );
      return {
        success: false,
        message: `Failed to update session: ${error.message}`,
      };
    } else if (!data || data.length === 0) {
      // This happens if RLS prevents the update or if the record with ID/user_id combo doesn't exist
      console.warn(
        "Supabase Update Warning (recordActions.js): No rows were updated. This could be due to RLS, or the record not matching the ID/User ID criteria."
      );
      return {
        success: false,
        message:
          "Failed to update session. Please ensure you are logged in and own this record.",
      };
    } else {
      console.log("Supabase Update Success (recordActions.js)! Data:", data);
      return { success: true, message: "Session updated successfully!" };
    }
  } catch (error) {
    console.error(
      "An unexpected error occurred during update (recordActions.js):",
      error
    );
    return {
      success: false,
      message: "An unexpected error occurred during update.",
    };
  }
}

/**
 * Deletes a nursing session record from the database.
 * @param {string} sessionId - The ID of the session to delete.
 * @param {string} userId - The ID of the user who owns the record.
 * @param {string} accessToken - The user's access token for authentication.
 * @returns {Promise<{success: boolean, message: string}>} Result of the operation.
 */
export async function deleteRecord(sessionId, userId, accessToken) {
  const client = initializeSupabaseClient(accessToken);

  console.log("Attempting to delete session from recordActions.js:");
  console.log("Session ID:", sessionId);
  console.log("User ID:", userId);

  try {
    const { error, count } = await client
      .from("nursing_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", userId); // Ensure RLS is satisfied

    if (error) {
      console.error(
        "Supabase Error deleting session (recordActions.js):",
        error.message
      );
      return {
        success: false,
        message: `Failed to delete session: ${error.message}`,
      };
    } else if (count === 0) {
      // This happens if RLS prevents the deletion or if the record with ID/user_id combo doesn't exist
      console.warn(
        "Supabase Delete Warning (recordActions.js): No rows were deleted. This could be due to RLS, or the record not matching the ID/User ID criteria."
      );
      return {
        success: false,
        message:
          "Failed to delete session. Please ensure you are logged in and own this record.",
      };
    } else {
      console.log("Supabase Delete Success (recordActions.js)!");
      return { success: true, message: "Session deleted successfully!" };
    }
  } catch (error) {
    console.error(
      "An unexpected error occurred during deletion (recordActions.js):",
      error
    );
    return {
      success: false,
      message: "An unexpected error occurred during deletion.",
    };
  }
}
