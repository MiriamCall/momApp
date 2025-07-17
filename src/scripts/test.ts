// import { createClient, SupabaseClient } from "@supabase/supabase-js";

// interface InitOptions {
//   userId: string;
//   accessToken: string;
// }

// export function initNursingTimer({ userId, accessToken }: InitOptions) {
//   // --- Supabase Client Setup ---
//   // Initialize the Supabase client with the provided access token.
//   const supabaseClient: SupabaseClient = createClient(
//     import.meta.env.PUBLIC_SUPABASE_URL!,
//     import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       global: {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       },
//     }
//   );

//   // --- DOM Element References ---
//   const timerDisplay = document.getElementById("timerDisplay") as HTMLElement;
//   const startButton = document.getElementById(
//     "startButton"
//   ) as HTMLButtonElement;
//   const stopButton = document.getElementById("stopButton") as HTMLButtonElement;
//   const resetButton = document.getElementById(
//     "resetButton"
//   ) as HTMLButtonElement;
//   const leftSideButton = document.getElementById(
//     "leftSideButton"
//   ) as HTMLButtonElement;
//   const rightSideButton = document.getElementById(
//     "rightSideButton"
//   ) as HTMLButtonElement;
//   const selectedSideDisplay = document.getElementById(
//     "selectedSide"
//   ) as HTMLElement;
//   const saveButton = document.getElementById("saveButton") as HTMLButtonElement;
//   const saveMessage = document.getElementById("saveMessage") as HTMLElement;

//   // --- Early exit if critical elements are missing ---
//   if (
//     !timerDisplay ||
//     !startButton ||
//     !stopButton ||
//     !resetButton ||
//     !leftSideButton ||
//     !rightSideButton ||
//     !selectedSideDisplay ||
//     !saveButton ||
//     !saveMessage
//   ) {
//     console.error(
//       "Timer initialization failed: One or more required DOM elements are missing."
//     );
//     return;
//   }

//   // --- Timer State ---
//   let timerInterval: number | null = null;
//   let startTime = 0;
//   let elapsedTime = 0; // Time in milliseconds
//   let isRunning = false;
//   let selectedSide: "left" | "right" | null = null;

//   // --- Helper Functions ---

//   /**
//    * Formats milliseconds into a HH:MM:SS string.
//    * @param timeInMs - The time in milliseconds.
//    * @returns The formatted time string.
//    */
//   function formatTime(timeInMs: number): string {
//     const totalSeconds = Math.floor(timeInMs / 1000);
//     const hours = Math.floor(totalSeconds / 3600)
//       .toString()
//       .padStart(2, "0");
//     const minutes = Math.floor((totalSeconds % 3600) / 60)
//       .toString()
//       .padStart(2, "0");
//     const seconds = (totalSeconds % 60).toString().padStart(2, "0");
//     return `${hours}:${minutes}:${seconds}`;
//   }

//   /**
//    * Centralized function to update the UI state of all buttons and indicators.
//    */
//   function updateUI() {
//     // Enable/disable timer controls
//     startButton.disabled = isRunning;
//     stopButton.disabled = !isRunning;
//     resetButton.disabled = isRunning || elapsedTime === 0;
//     saveButton.disabled = isRunning || elapsedTime === 0 || !selectedSide;

//     // Update side button visual state
//     leftSideButton.classList.toggle("ring-4", selectedSide === "left");
//     leftSideButton.classList.toggle("ring-blue-300", selectedSide === "left");
//     rightSideButton.classList.toggle("ring-4", selectedSide === "right");
//     rightSideButton.classList.toggle(
//       "ring-purple-300",
//       selectedSide === "right"
//     );
//   }

//   /**
//    * Updates the timer display based on elapsed time.
//    */
//   function updateTimerDisplay() {
//     if (isRunning) {
//       elapsedTime = Date.now() - startTime;
//     }
//     timerDisplay.textContent = formatTime(elapsedTime);
//   }

//   // --- Event Handlers ---

//   function handleStart() {
//     if (isRunning) return;
//     isRunning = true;
//     // If resuming, subtract the already elapsed time to continue from where we left off.
//     startTime = Date.now() - elapsedTime;
//     timerInterval = window.setInterval(updateTimerDisplay, 100); // Update frequently for smooth display
//     saveMessage.textContent = "";
//     updateUI();
//   }

//   function handleStop() {
//     if (!isRunning || timerInterval === null) return;
//     isRunning = false;
//     clearInterval(timerInterval);
//     timerInterval = null;
//     // Capture the final, precise elapsed time.
//     elapsedTime = Date.now() - startTime;
//     updateTimerDisplay(); // Final display update
//     updateUI();
//   }

//   function handleReset() {
//     if (isRunning) handleStop(); // Stop the timer if it's running

//     elapsedTime = 0;
//     startTime = 0;
//     selectedSide = null;

//     timerDisplay.textContent = "00:00:00";
//     selectedSideDisplay.textContent = "Side: Not Selected";
//     saveMessage.textContent = "";

//     updateUI();
//   }

//   function handleSideSelection(side: "left" | "right") {
//     selectedSide = side;
//     selectedSideDisplay.textContent = `Side: ${
//       side.charAt(0).toUpperCase() + side.slice(1)
//     }`;
//     updateUI();
//   }

//   async function handleSave() {
//     if (elapsedTime === 0) {
//       saveMessage.textContent =
//         "Timer is at 0. Start and stop the timer before saving.";
//       return;
//     }
//     if (!selectedSide) {
//       saveMessage.textContent =
//         "Please select a side (Left or Right) before saving.";
//       return;
//     }

//     saveButton.disabled = true;
//     saveMessage.textContent = "Saving session...";

//     const sessionData = {
//       user_id: userId,
//       // Use start time and calculate end time from precise elapsed duration
//       start_time: new Date(startTime).toISOString(),
//       end_time: new Date(startTime + elapsedTime).toISOString(),
//       duration_seconds: Math.floor(elapsedTime / 1000),
//       nursing_side: selectedSide,
//     };

//     try {
//       const { error } = await supabaseClient
//         .from("nursing_sessions")
//         .insert([sessionData]);

//       if (error) {
//         throw error;
//       }

//       saveMessage.textContent = "Session saved successfully!";
//       setTimeout(() => window.location.reload(), 800); // Reload to show updated history
//     } catch (err: any) {
//       console.error("Error saving session:", err);
//       saveMessage.textContent = `Error: ${err.message}`;
//       saveButton.disabled = false; // Re-enable button on failure
//     }
//   }

//   // --- Initial Setup ---

//   // Attach event listeners
//   startButton.addEventListener("click", handleStart);
//   stopButton.addEventListener("click", handleStop);
//   resetButton.addEventListener("click", handleReset);
//   leftSideButton.addEventListener("click", () => handleSideSelection("left"));
//   rightSideButton.addEventListener("click", () => handleSideSelection("right"));
//   saveButton.addEventListener("click", handleSave);

//   // Set initial UI state
//   handleReset();
// }
