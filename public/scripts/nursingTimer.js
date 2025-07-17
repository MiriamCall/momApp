// public/scripts/nursingTimer.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export function initNursingTimer({ userId, accessToken }) {
  // --- Supabase Client Setup ---
  const supabaseClient = createClient(
    "https://nbjicydejhujbharetbk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iamljeWRlamh1amJoYXJldGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Mzk0OTQsImV4cCI6MjA2NzMxNTQ5NH0.ew6OfER-EfHZJbfb5cchQ3CNqxyEHmI08g5R0bkMyOM",
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  // --- DOM Element References ---
  // Using type assertions only if you're using TypeScript, otherwise remove ': HTMLElement' parts.
  const timerDisplay = document.getElementById("timerDisplay");
  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("stopButton");
  const resetButton = document.getElementById("resetButton");
  const leftSideButton = document.getElementById("leftSideButton");
  const rightSideButton = document.getElementById("rightSideButton");
  const selectedSideDisplay = document.getElementById("selectedSide");
  const saveButton = document.getElementById("saveButton");
  const saveMessage = document.getElementById("saveMessage");

  // --- Early exit if critical elements are missing ---
  // This makes the script more robust if the HTML structure changes.
  if (
    !timerDisplay ||
    !startButton ||
    !stopButton ||
    !resetButton ||
    !leftSideButton ||
    !rightSideButton ||
    !selectedSideDisplay ||
    !saveButton ||
    !saveMessage
  ) {
    console.error(
      "NursingTimer initialization failed: One or more required DOM elements are missing."
    );
    return; // Stop execution if elements aren't found
  }

  // --- Timer State ---
  let timerInterval = null; // Stores the interval ID, null when not running
  let startTime = 0; // Timestamp when the current 'running' session began (or resumed)
  let elapsedTime = 0; // Total accumulated time in milliseconds
  let isRunning = false;
  let selectedSide = null; // 'left' | 'right' | null

  // --- Helper Functions ---

  /**
   * Formats milliseconds into a HH:MM:SS string.
   * Updates to handle milliseconds for smoother display.
   * @param timeInMs - The time in milliseconds.
   * @returns The formatted time string.
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
   * Centralized function to update the UI state of all buttons and indicators.
   * This is a major improvement for maintainability.
   */
  function updateUI() {
    // Enable/disable timer controls
    startButton.disabled = isRunning;
    stopButton.disabled = !isRunning;
    resetButton.disabled = isRunning || elapsedTime === 0;
    saveButton.disabled = isRunning || elapsedTime === 0 || !selectedSide;

    // Update side button visual state
    // Remove previous rings first to ensure correct toggle behavior
    leftSideButton.classList.remove(
      "ring-4",
      "ring-blue-300",
      "ring-purple-300",
      "ring-peach-500",
      "ring-offset-2"
    );
    rightSideButton.classList.remove(
      "ring-4",
      "ring-blue-300",
      "ring-purple-300",
      "ring-peach-500",
      "ring-offset-2"
    );

    if (selectedSide === "left") {
      leftSideButton.classList.add("ring-4", "ring-blue-300", "ring-offset-2");
    } else {
      leftSideButton.classList.add("ring-blue-400"); // Add default ring if not selected
    }
    if (selectedSide === "right") {
      rightSideButton.classList.add(
        "ring-4",
        "ring-purple-300",
        "ring-offset-2"
      );
    } else {
      rightSideButton.classList.add("ring-purple-400"); // Add default ring if not selected
    }
    // Re-apply original side button colors based on your Tailwind setup, if needed.
    // The focus-ring classes will handle the ring-offset-2 and other colors for active focus.
  }

  /**
   * Updates the timer display based on elapsed time.
   */
  function updateTimerDisplay() {
    if (isRunning) {
      elapsedTime = Date.now() - startTime;
    }
    timerDisplay.textContent = formatTime(elapsedTime);
  }

  // --- Event Handlers ---

  function handleStart() {
    if (isRunning) return; // Prevent starting if already running

    isRunning = true;
    // Calculate startTime to allow for pausing/resuming
    startTime = Date.now() - elapsedTime;

    // Update frequently for smooth display (100ms)
    timerInterval = setInterval(updateTimerDisplay, 100);
    saveMessage.textContent = ""; // Clear any previous save messages
    updateUI(); // Update button states
  }

  function handleStop() {
    if (!isRunning || timerInterval === null) return; // Prevent stopping if not running

    isRunning = false;
    clearInterval(timerInterval); // Stop the interval
    timerInterval = null; // Clear the interval ID
    // Capture the final, precise elapsed time
    elapsedTime = Date.now() - startTime;
    updateTimerDisplay(); // Final display update to show precise stopped time
    updateUI(); // Update button states
  }

  function handleReset() {
    if (isRunning) handleStop(); // Stop the timer if it's running before resetting

    elapsedTime = 0;
    startTime = 0;
    selectedSide = null; // Clear selected side

    timerDisplay.textContent = "00:00:00"; // Reset display to zero
    selectedSideDisplay.textContent = "Side: Not Selected"; // Reset side display
    saveMessage.textContent = ""; // Clear save message

    updateUI(); // Update button states (will disable save, enable start, etc.)
  }

  function handleSideSelection(side) {
    selectedSide = side;
    selectedSideDisplay.textContent = `Side: ${
      side.charAt(0).toUpperCase() + side.slice(1)
    }`;
    updateUI(); // Update button states (might enable save) and side button visuals
  }

  async function handleSave() {
    if (elapsedTime === 0) {
      saveMessage.textContent =
        "Timer is at 0. Start and stop the timer before saving.";
      return;
    }
    if (!selectedSide) {
      saveMessage.textContent =
        "Please select a side (Left or Right) before saving.";
      return;
    }
    // Ensure the timer has been started and stopped for a valid session
    if (startTime === 0 || elapsedTime === 0) {
      // Check elapsedTime as well
      saveMessage.textContent =
        "Timer was not started or stopped correctly. Please reset and try again.";
      return;
    }

    saveButton.disabled = true; // Disable save button immediately
    saveMessage.textContent = "Saving session...";

    const sessionData = {
      user_id: userId,
      // Use startTime and calculate endTime from precise elapsed duration
      start_time: new Date(startTime).toISOString(),
      // endTime is calculated by adding the total elapsedTime to the original startTime
      end_time: new Date(startTime + elapsedTime).toISOString(),
      duration_seconds: Math.floor(elapsedTime / 1000), // Convert milliseconds back to seconds
      nursing_side: selectedSide,
    };

    try {
      const { error } = await supabaseClient
        .from("nursing_sessions")
        .insert([sessionData]);

      if (error) {
        // Log error for debugging, display user-friendly message
        console.error("Supabase insert error:", error);
        throw error; // Re-throw to be caught by the outer catch block
      }

      saveMessage.textContent = "Session saved successfully!";
      // Reload after a short delay to allow the user to see the success message
      // and for the history list to potentially refresh.
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      console.error("Error saving session:", err);
      saveMessage.textContent = `Error: ${
        err.message || "An unknown error occurred."
      }`;
      saveButton.disabled = false; // Re-enable button on failure
    }
  }

  // --- Initial Setup ---

  // Attach event listeners
  startButton.addEventListener("click", handleStart);
  stopButton.addEventListener("click", handleStop);
  resetButton.addEventListener("click", handleReset);
  leftSideButton.addEventListener("click", () => handleSideSelection("left"));
  rightSideButton.addEventListener("click", () => handleSideSelection("right"));
  saveButton.addEventListener("click", handleSave);

  // Set initial UI state by calling reset.
  // This ensures all buttons are in their correct initial disabled/enabled state.
  handleReset();
}
