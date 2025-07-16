// // src/scripts/nursingTimerClient.ts
// import { createClient } from "@supabase/supabase-js";

// // Initialize the client-side Supabase client
// // This client uses browser storage for session management and handles auth tokens automatically.
// const supabaseClient = createClient(
//   import.meta.env.SUPABASE_URL,
//   import.meta.env.SUPABASE_ANON_KEY
// );

// interface TimerElements {
//   timerDisplay: HTMLElement | null;
//   startButton: HTMLButtonElement | null;
//   stopButton: HTMLButtonElement | null;
//   resetButton: HTMLButtonElement | null;
//   leftSideButton: HTMLButtonElement | null;
//   rightSideButton: HTMLButtonElement | null;
//   selectedSideDisplay: HTMLElement | null;
//   saveButton: HTMLButtonElement | null;
//   saveMessage: HTMLElement | null;
// }

// /**
//  * Initializes the nursing timer functionality.
//  * @param elements An object containing references to all necessary DOM elements.
//  * @param userId The ID of the currently authenticated user.
//  */
// export function initializeNursingTimer(
//   elements: TimerElements,
//   userId: string
// ) {
//   const {
//     timerDisplay,
//     startButton,
//     stopButton,
//     resetButton,
//     leftSideButton,
//     rightSideButton,
//     selectedSideDisplay,
//     saveButton,
//     saveMessage,
//   } = elements;

//   // --- DEBUGGING LOGS ---
//   console.log("NursingTimer script loaded via external module.");
//   console.log("timerDisplay element:", timerDisplay);
//   console.log("startButton element:", startButton);
//   console.log("stopButton element:", stopButton);
//   console.log("resetButton element:", resetButton);
//   console.log("leftSideButton element:", leftSideButton);
//   console.log("rightSideButton element:", rightSideButton);
//   console.log("selectedSideDisplay element:", selectedSideDisplay);
//   console.log("saveButton element:", saveButton);
//   console.log("saveMessage element:", saveMessage);
//   // --- END DEBUGGING LOGS ---

//   let timerInterval: number | undefined; // Stores the interval ID for the timer (for clearInterval)
//   let seconds = 0; // Stores the current time in seconds for the session
//   let selectedSide: string | null = null; // Stores the selected nursing side ('left' or 'right')
//   let startTime: Date | null = null; // Stores the Date object when the timer starts
//   let endTime: Date | null = null; // Stores the Date object when the timer stops

//   /**
//    * Formats total seconds into a HH:MM:SS string for display.
//    * @param {number} totalSeconds - The total number of seconds elapsed.
//    * @returns {string} Formatted time string (e.g., "00:01:30").
//    */
//   function formatTime(totalSeconds: number): string {
//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     const remainingSeconds = totalSeconds % 60;
//     return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
//       2,
//       "0"
//     )}:${String(remainingSeconds).padStart(2, "0")}`;
//   }

//   /**
//    * Starts the nursing timer.
//    * Disables Start button, enables Stop button, clears messages.
//    */
//   function startTimer() {
//     if (
//       !startButton ||
//       !stopButton ||
//       !resetButton ||
//       !saveButton ||
//       !saveMessage ||
//       !timerDisplay
//     ) {
//       console.error("One or more timer elements are missing in startTimer.");
//       return;
//     }
//     startButton.disabled = true;
//     stopButton.disabled = false;
//     resetButton.disabled = true; // Cannot reset while timer is running
//     saveButton.disabled = true; // Cannot save while timer is running
//     saveMessage.textContent = ""; // Clear any previous messages

//     // Capture start time when the timer begins
//     startTime = new Date();

//     timerInterval = window.setInterval(() => {
//       // Use window.setInterval for clarity
//       seconds++;
//       timerDisplay.textContent = formatTime(seconds);
//     }, 1000);
//     console.log("Timer started.");
//   }

//   /**
//    * Stops the nursing timer.
//    * Enables Start and Reset buttons, and Save button if a side is selected.
//    */
//   function stopTimer() {
//     if (!startButton || !stopButton || !resetButton || !saveButton) {
//       console.error("One or more timer elements are missing in stopTimer.");
//       return;
//     }
//     startButton.disabled = false;
//     stopButton.disabled = true;
//     resetButton.disabled = false;
//     if (timerInterval !== undefined) {
//       clearInterval(timerInterval); // Stop the timer interval
//     }

//     // Capture end time when the timer stops
//     endTime = new Date();

//     // Enable save button only if a side is already selected AND timer has run for some time
//     if (selectedSide && seconds > 0) {
//       saveButton.disabled = false;
//     }
//     console.log("Timer stopped.");
//   }

//   /**
//    * Resets the timer and selected side back to initial state.
//    */
//   function resetTimer() {
//     if (
//       !timerDisplay ||
//       !resetButton ||
//       !saveButton ||
//       !selectedSideDisplay ||
//       !leftSideButton ||
//       !rightSideButton ||
//       !saveMessage
//     ) {
//       console.error("One or more timer elements are missing in resetTimer.");
//       return;
//     }
//     stopTimer(); // Ensure timer is stopped first
//     seconds = 0;
//     timerDisplay.textContent = formatTime(seconds);
//     resetButton.disabled = true;
//     saveButton.disabled = true; // Disable save after reset
//     selectedSide = null; // Clear selected side
//     startTime = null; // Clear start time
//     endTime = null; // Clear end time
//     selectedSideDisplay.textContent = "Side: Not Selected";
//     // Remove highlight from side buttons
//     leftSideButton.classList.remove(
//       "ring-2",
//       "ring-offset-2",
//       "ring-peach-500"
//     );
//     rightSideButton.classList.remove(
//       "ring-2",
//       "ring-offset-2",
//       "ring-peach-500"
//     );
//     saveMessage.textContent = ""; // Clear any messages
//     console.log("Timer reset.");
//   }

//   /**
//    * Sets the selected nursing side and updates UI to reflect choice.
//    * @param {string} side - 'left' or 'right'.
//    */
//   function selectSide(side: string) {
//     if (
//       !selectedSideDisplay ||
//       !leftSideButton ||
//       !rightSideButton ||
//       !saveButton
//     ) {
//       console.error(
//         "One or more side selection elements are missing in selectSide."
//       );
//       return;
//     }
//     selectedSide = side;
//     selectedSideDisplay.textContent = `Side: ${
//       side.charAt(0).toUpperCase() + side.slice(1)
//     }`;

//     // Add/remove highlight ring for visual feedback
//     leftSideButton.classList.toggle("ring-2", side === "left");
//     leftSideButton.classList.toggle("ring-offset-2", side === "left");
//     rightSideButton.classList.toggle("ring-2", side === "right");
//     rightSideButton.classList.toggle("ring-offset-2", side === "right");

//     // If timer is stopped and a side is now selected, enable save button
//     if (stopButton.disabled && seconds > 0) {
//       saveButton.disabled = false;
//     }
//     console.log("Side selected:", side);
//   }

//   // Event Listeners for timer control buttons
//   // Add checks for element existence before attaching listeners
//   if (startButton) startButton.addEventListener("click", startTimer);
//   else console.error("startButton not found, cannot attach event listener.");

//   if (stopButton) stopButton.addEventListener("click", stopTimer);
//   else console.error("stopButton not found, cannot attach event listener.");

//   if (resetButton) resetButton.addEventListener("click", resetTimer);
//   else console.error("resetButton not found, cannot attach event listener.");

//   // Event Listeners for side selection buttons
//   if (leftSideButton)
//     leftSideButton.addEventListener("click", () => selectSide("left"));
//   else console.error("leftSideButton not found, cannot attach event listener.");

//   if (rightSideButton)
//     rightSideButton.addEventListener("click", () => selectSide("right"));
//   else
//     console.error("rightSideButton not found, cannot attach event listener.");

//   /**
//    * Handles saving the nursing session data to Supabase.
//    * This function is asynchronous as it interacts with the Supabase API.
//    */
//   if (saveButton) {
//     saveButton.addEventListener("click", async () => {
//       if (!saveMessage || !selectedSideDisplay || !saveButton) {
//         console.error(
//           "One or more save elements are missing in saveButton click handler."
//         );
//         return;
//       }
//       // Basic validation before attempting to save
//       if (seconds === 0) {
//         saveMessage.textContent =
//           "Timer is at 0. Start and stop the timer before saving.";
//         return;
//       }
//       if (!selectedSide) {
//         saveMessage.textContent =
//           "Please select a side (Left or Right) before saving.";
//         return;
//       }
//       if (!startTime || !endTime) {
//         saveMessage.textContent =
//           "Timer was not started or stopped correctly. Please reset and try again.";
//         return;
//       }

//       saveButton.disabled = true; // Disable button to prevent multiple submissions
//       saveMessage.textContent = "Saving session..."; // User feedback

//       // Insert data into the 'nursing_sessions' table
//       const { data, error } = await supabaseClient
//         .from("nursing_sessions")
//         .insert([
//           {
//             user_id: userId, // userId is securely passed from the server-side Astro page
//             start_time: startTime.toISOString(), // Convert Date to ISO string for TIMESTAMPTZ
//             end_time: endTime.toISOString(), // Convert Date to ISO string for TIMESTAMPTZ
//             duration_seconds: seconds,
//             nursing_side: selectedSide, // Renamed to match schema
//           },
//         ]);

//       if (error) {
//         console.error("Error saving nursing session:", error);
//         saveMessage.textContent = `Error saving: ${error.message}`;
//         saveButton.disabled = false; // Re-enable save button on error
//       } else {
//         saveMessage.textContent = "Session saved successfully!";
//         resetTimer(); // Reset the timer and side selection after successful save

//         // Reload the page after a short delay to refresh the "Your Nursing History" list
//         // This is a simple way to update the displayed list. For more complex apps,
//         // you might fetch and append the new item dynamically without a full reload.
//         setTimeout(() => {
//           window.location.reload();
//         }, 800); // Give the user a moment to see the success message
//       }
//     });
//   } else {
//     console.error("saveButton not found, cannot attach event listener.");
//   }

//   // Initial state setup when the component loads
//   // Add checks before setting disabled property
//   if (stopButton) stopButton.disabled = true;
//   if (resetButton) resetButton.disabled = true;
//   if (saveButton) saveButton.disabled = true;

//   console.log("NursingTimer script initialization complete.");
// }
