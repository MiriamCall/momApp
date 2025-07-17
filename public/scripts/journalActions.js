// public/scripts/journalActions.js
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
      "https://nbjicydejhujbharetbk.supabase.co", // Your Supabase Project URL
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iamljeWRlamh1amJoYXJldGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Mzk0OTQsImV4cCI6MjA2NzMxNTQ5NH0.ew6OfER-EfHZJbfb5cchQ3CNqxyEHmI08g5R0bkMyOM", // Your Supabase Anon Key
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Crucial for RLS
          },
        },
      }
    );
    console.log(
      "Supabase client initialized in journalActions.js with access token."
    );
  }
  return supabaseClient;
}

/**
 * Inserts a new journal entry into the database.
 * @param {string} entryText - The text content of the journal entry.
 * @param {string} userId - The ID of the user creating the entry.
 * @param {string} accessToken - The user's access token for authentication.
 * @returns {Promise<{success: boolean, message: string, data?: object[]}>} Result of the operation.
 */
export async function insertJournalEntry(entryText, userId, accessToken) {
  const client = initializeSupabaseClient(accessToken);

  console.log("Attempting to insert journal entry from journalActions.js:");
  console.log("User ID:", userId);
  console.log("Entry Text:", entryText);

  try {
    const { data, error } = await client
      .from("journal_entries")
      .insert({
        user_id: userId,
        entry_text: entryText,
      })
      .select(); // Select the inserted data to return it

    if (error) {
      console.error(
        "Supabase Error inserting journal entry (journalActions.js):",
        error.message
      );
      return {
        success: false,
        message: `Failed to add entry: ${error.message}`,
      };
    } else {
      console.log("Supabase Insert Success (journalActions.js)! Data:", data);
      return {
        success: true,
        message: "Entry added successfully!",
        data: data,
      };
    }
  } catch (error) {
    console.error(
      "An unexpected error occurred during insert (journalActions.js):",
      error
    );
    return {
      success: false,
      message: "An unexpected error occurred during entry creation.",
    };
  }
}

/**
 * Updates an existing journal entry in the database.
 * @param {string} entryId - The ID of the journal entry to update.
 * @param {string} newEntryText - The new text content for the entry.
 * @param {string} userId - The ID of the user who owns the entry.
 * @param {string} accessToken - The user's access token for authentication.
 * @returns {Promise<{success: boolean, message: string}>} Result of the operation.
 */
export async function updateJournalEntry(
  entryId,
  newEntryText,
  userId,
  accessToken
) {
  const client = initializeSupabaseClient(accessToken);

  console.log("Attempting to update journal entry from journalActions.js:");
  console.log("Entry ID:", entryId);
  console.log("User ID:", userId);
  console.log("New Entry Text:", newEntryText);

  try {
    const { error, count } = await client
      .from("journal_entries")
      .update({
        entry_text: newEntryText,
        updated_at: new Date().toISOString(), // Manually update timestamp if not using a trigger
      })
      .eq("id", entryId)
      .eq("user_id", userId); // Ensure RLS is satisfied

    if (error) {
      console.error(
        "Supabase Error updating journal entry (journalActions.js):",
        error.message
      );
      return {
        success: false,
        message: `Failed to update entry: ${error.message}`,
      };
    } else if (count === 0) {
      console.warn(
        "Supabase Update Warning (journalActions.js): No rows were updated. This could be due to RLS, or the record not matching the ID/User ID criteria."
      );
      return {
        success: false,
        message:
          "Failed to update entry. Please ensure you are logged in and own this entry.",
      };
    } else {
      console.log("Supabase Update Success (journalActions.js)!");
      return { success: true, message: "Entry updated successfully!" };
    }
  } catch (error) {
    console.error(
      "An unexpected error occurred during update (journalActions.js):",
      error
    );
    return {
      success: false,
      message: "An unexpected error occurred during entry update.",
    };
  }
}

/**
 * Deletes a journal entry from the database.
 * @param {string} entryId - The ID of the journal entry to delete.
 * @param {string} userId - The ID of the user who owns the entry.
 * @param {string} accessToken - The user's access token for authentication.
 * @returns {Promise<{success: boolean, message: string}>} Result of the operation.
 */
export async function deleteJournalEntry(entryId, userId, accessToken) {
  const client = initializeSupabaseClient(accessToken);

  console.log("Attempting to delete journal entry from journalActions.js:");
  console.log("Entry ID:", entryId);
  console.log("User ID:", userId);

  try {
    const { error, count } = await client
      .from("journal_entries")
      .delete()
      .eq("id", entryId)
      .eq("user_id", userId); // Ensure RLS is satisfied

    if (error) {
      console.error(
        "Supabase Error deleting journal entry (journalActions.js):",
        error.message
      );
      return {
        success: false,
        message: `Failed to delete entry: ${error.message}`,
      };
    } else if (count === 0) {
      console.warn(
        "Supabase Delete Warning (journalActions.js): No rows were deleted. This could be due to RLS, or the record not matching the ID/User ID criteria."
      );
      return {
        success: false,
        message:
          "Failed to delete entry. Please ensure you are logged in and own this entry.",
      };
    } else {
      console.log("Supabase Delete Success (journalActions.js)!");
      return { success: true, message: "Entry deleted successfully!" };
    }
  } catch (error) {
    console.error(
      "An unexpected error occurred during deletion (journalActions.js):",
      error
    );
    return {
      success: false,
      message: "An unexpected error occurred during entry deletion.",
    };
  }
}
