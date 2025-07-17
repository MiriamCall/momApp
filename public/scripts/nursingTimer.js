// public/scripts/nursingTimer.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let supabaseClient = null;

/**
 * Initializes the Supabase client.
 * @param {string} accessToken - The user's JWT.
 * @returns {object} The Supabase client instance.
 */
export function initializeSupabaseClient(accessToken) {
  if (!supabaseClient) {
    supabaseClient = createClient(
      "https://nbjicydejhujbharetbk.supabase.co", // Your Supabase Project URL
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iamljeWRlamh1amJoYXJldGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Mzk0OTQsImV4cCI6MjA2NzMxNTQ5NH0.ew6OfER-EfHZJbfb5cchQ3CNqxyEHmI08g5R0bkMyOM", // Your Supabase Anon Key
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );
  }
  return supabaseClient;
}

/**
 * Inserts a nursing session manually (utility function).
 * @param {string} nursingSide
 * @param {string} startTime
 * @param {number} durationSeconds
 * @param {string} userId
 * @param {string} accessToken
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function insertManualNursingSession(
  nursingSide,
  startTime,
  durationSeconds,
  userId,
  accessToken
) {
  const client = initializeSupabaseClient(accessToken);
  try {
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(
      startDateTime.getTime() + durationSeconds * 1000
    );

    const { error } = await client.from("nursing_sessions").insert({
      user_id: userId,
      nursing_side: nursingSide,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      duration_seconds: durationSeconds,
    });

    if (error) {
      throw error;
    }
    return { success: true, message: "Session added successfully!" };
  } catch (error) {
    console.error("Supabase Error inserting manual session:", error.message);
    return {
      success: false,
      message: `Failed to add session: ${error.message}`,
    };
  }
}

/**
 * Initializes the interactive nursing timer component.
 * @param {{userId: string, accessToken: string}} props
 */
export function initNursingTimer({ userId, accessToken }) {
  const supabase = initializeSupabaseClient(accessToken);

  // --- DOM Element References ---
  const timerDisplay = document.getElementById("timerDisplay");
  const toggleStartStopButton = document.getElementById(
    "toggleStartStopButton"
  );
  // Removed playIcon and stopIcon references as they are no longer in the HTML
  const resetButton = document.getElementById("resetButton");
  const nursingSideSelect = document.getElementById("nursingSideSelect");
  const saveButton = document.getElementById("saveButton");
  const saveMessage = document.getElementById("saveMessage");

  // --- Early exit if critical elements are missing ---
  if (
    !timerDisplay ||
    !toggleStartStopButton ||
    !resetButton ||
    !nursingSideSelect ||
    !saveButton ||
    !saveMessage
  ) {
    // Removed playIcon and stopIcon from checks
    console.error(
      "NursingTimer init failed: One or more required DOM elements are missing."
    );
    return;
  }

  // --- Timer State ---
  let timerInterval = null;
  let startTime = 0;
  let elapsedTime = 0;
  let isRunning = false;
  let selectedSide = ""; // Default to empty string for "Select a side"

  // --- Helper Functions ---

  /**
   * Formats milliseconds into a HH:MM:SS string.
   * @param {number} timeInMs - The time in milliseconds.
   */
  function formatTime(timeInMs) {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Centralized function to update the UI state.
   */
  function updateUI() {
    // Update Start/Stop button appearance
    if (isRunning) {
      toggleStartStopButton.querySelector("span").textContent = "Stop";
      toggleStartStopButton.classList.replace("bg-green-500", "bg-red-500");
      toggleStartStopButton.classList.replace(
        "hover:bg-green-600",
        "hover:bg-red-600"
      );
      toggleStartStopButton.classList.replace(
        "focus:ring-green-500",
        "focus:ring-red-500"
      );
    } else {
      toggleStartStopButton.querySelector("span").textContent = "Start";
      toggleStartStopButton.classList.replace("bg-red-500", "bg-green-500");
      toggleStartStopButton.classList.replace(
        "hover:bg-red-600",
        "hover:bg-green-600"
      );
      toggleStartStopButton.classList.replace(
        "focus:ring-red-500",
        "focus:ring-green-500"
      );
    }

    // Update button disabled states
    resetButton.disabled = isRunning || elapsedTime === 0;
    // Save button is enabled if not running, time is > 0, and a side is selected (not empty string)
    saveButton.disabled = isRunning || elapsedTime === 0 || selectedSide === "";
  }

  /**
   * Updates the timer display text.
   */
  function updateTimerDisplay() {
    const currentTime = isRunning ? Date.now() - startTime : elapsedTime;
    timerDisplay.textContent = formatTime(currentTime);
  }

  // --- Event Handlers ---

  function handleToggleStartStop() {
    isRunning = !isRunning;
    if (isRunning) {
      startTime = Date.now() - elapsedTime;
      timerInterval = setInterval(updateTimerDisplay, 100);
      saveMessage.textContent = "";
    } else {
      clearInterval(timerInterval);
      elapsedTime = Date.now() - startTime;
    }
    updateUI();
  }

  function handleReset() {
    if (isRunning) {
      clearInterval(timerInterval);
    }
    isRunning = false;
    elapsedTime = 0;
    startTime = 0;
    selectedSide = ""; // Reset to empty string for "Select a side"
    nursingSideSelect.value = ""; // Reset dropdown to default option
    saveMessage.textContent = "";
    updateTimerDisplay(); // Will show 00:00:00
    updateUI();
  }

  function handleSideSelection() {
    selectedSide = nursingSideSelect.value; // Get value from dropdown
    updateUI();
  }

  async function handleSave() {
    if (elapsedTime === 0) {
      saveMessage.textContent =
        "Timer is at 0. Start and stop the timer before saving.";
      return;
    }
    if (selectedSide === "") {
      // Check if a side is selected (not empty string)
      saveMessage.textContent = "Please select a nursing side before saving.";
      return;
    }

    saveButton.disabled = true;
    saveMessage.textContent = "Saving session...";

    const sessionData = {
      user_id: userId,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(startTime + elapsedTime).toISOString(),
      duration_seconds: Math.floor(elapsedTime / 1000),
      nursing_side: selectedSide,
    };

    try {
      const { error } = await supabase
        .from("nursing_sessions")
        .insert([sessionData]);
      if (error) throw error;

      saveMessage.textContent = "Session saved successfully!";
      // Reload after a short delay to allow the user to see the success message
      // and for the history list to potentially refresh.
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      console.error("Error saving session:", err);
      saveMessage.textContent = `Error: ${
        err.message || "An unknown error occurred."
      }`;
      saveButton.disabled = false; // Re-enable on failure
    }
  }

  // --- Initial Setup ---
  toggleStartStopButton.addEventListener("click", handleToggleStartStop);
  resetButton.addEventListener("click", handleReset);
  nursingSideSelect.addEventListener("change", handleSideSelection); // Listen to change event
  saveButton.addEventListener("click", handleSave);

  handleReset(); // Set the initial state of the component on load.
}
