// // src/components/NursingTimer.tsx
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { createClient } from "@supabase/supabase-js";

// interface NursingTimerProps {
//   userId: string;
//   accessToken: string;
// }

// const NursingTimer: React.FC<NursingTimerProps> = ({ userId, accessToken }) => {
//   const [seconds, setSeconds] = useState(0);
//   const [isRunning, setIsRunning] = useState(false);
//   const [selectedSide, setSelectedSide] = useState<string | null>(null);
//   const [saveMessage, setSaveMessage] = useState<string>("");

//   const timerIntervalRef = useRef<number | null>(null);
//   const startTimeRef = useRef<Date | null>(null);
//   const endTimeRef = useRef<Date | null>(null);

//   // Supabase client initialization (memoized to avoid re-creation)
//   const supabaseClient = useRef(
//     createClient(
//       import.meta.env.PUBLIC_SUPABASE_URL!,
//       import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         global: {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         },
//       }
//     )
//   );

//   const formatTime = useCallback((totalSeconds: number): string => {
//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     const remainingSeconds = totalSeconds % 60;
//     return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
//       2,
//       "0"
//     )}:${String(remainingSeconds).padStart(2, "0")}`;
//   }, []);

//   const startTimer = useCallback(() => {
//     setIsRunning(true);
//     startTimeRef.current = new Date();
//     setSaveMessage("");

//     if (timerIntervalRef.current) {
//       clearInterval(timerIntervalRef.current);
//     }
//     timerIntervalRef.current = window.setInterval(() => {
//       setSeconds((prevSeconds) => prevSeconds + 1);
//     }, 1000);
//   }, []);

//   const stopTimer = useCallback(() => {
//     setIsRunning(false);
//     clearInterval(timerIntervalRef.current!);
//     timerIntervalRef.current = null;
//     endTimeRef.current = new Date();
//   }, []);

//   const resetTimer = useCallback(() => {
//     stopTimer();
//     setSeconds(0);
//     setSelectedSide(null);
//     startTimeRef.current = null;
//     endTimeRef.current = null;
//     setSaveMessage("");
//   }, [stopTimer]); // stopTimer is a dependency because it's called inside resetTimer

//   const handleSelectSide = useCallback((side: string) => {
//     setSelectedSide(side);
//   }, []);

//   const handleSaveSession = useCallback(async () => {
//     if (seconds === 0) {
//       setSaveMessage("Timer is at 0. Start and stop the timer before saving.");
//       return;
//     }
//     if (!selectedSide) {
//       setSaveMessage("Please select a side (Left or Right) before saving.");
//       return;
//     }
//     if (!startTimeRef.current || !endTimeRef.current) {
//       setSaveMessage(
//         "Timer was not started or stopped correctly. Please reset and try again."
//       );
//       return;
//     }

//     setSaveMessage("Saving session...");

//     try {
//       const { error } = await supabaseClient.current
//         .from("nursing_sessions")
//         .insert([
//           {
//             user_id: userId,
//             start_time: startTimeRef.current.toISOString(),
//             end_time: endTimeRef.current.toISOString(),
//             duration_seconds: seconds,
//             nursing_side: selectedSide,
//           },
//         ]);

//       if (error) {
//         setSaveMessage(`Error saving: ${error.message}`);
//       } else {
//         setSaveMessage("Session saved successfully!");
//         resetTimer();
//         // Optionally, you might want to trigger a data refetch in the parent `feeding_timer.astro`
//         // or reload the page to show the new session in the history.
//         // For simplicity, a direct reload is used here, but consider a more reactive approach in a larger app.
//         setTimeout(() => window.location.reload(), 800);
//       }
//     } catch (err: any) {
//       setSaveMessage(`Unexpected error: ${err.message}`);
//     }
//   }, [seconds, selectedSide, userId, resetTimer]);

//   // Clean up timer on component unmount
//   useEffect(() => {
//     return () => {
//       if (timerIntervalRef.current) {
//         clearInterval(timerIntervalRef.current);
//       }
//     };
//   }, []);

//   const isSaveDisabled =
//     !selectedSide || seconds === 0 || isRunning || !endTimeRef.current;

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md mx-auto border border-peach-200">
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-peach-700 mb-4">
//           Current Session
//         </h2>
//         <div
//           className="text-5xl font-mono text-gray-800 mb-4"
//           id="timerDisplay"
//         >
//           {formatTime(seconds)}
//         </div>
//         <div className="flex justify-center gap-4 mb-6">
//           <button
//             id="startButton"
//             className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
//             onClick={startTimer}
//             disabled={isRunning}
//           >
//             Start
//           </button>
//           <button
//             id="stopButton"
//             className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//             onClick={stopTimer}
//             disabled={!isRunning}
//           >
//             Stop
//           </button>
//           <button
//             id="resetButton"
//             className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
//             onClick={resetTimer}
//             disabled={isRunning || seconds === 0}
//           >
//             Reset
//           </button>
//         </div>

//         <div className="flex justify-center gap-4 mb-6">
//           <button
//             id="leftSideButton"
//             className={`side-button bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-full shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//               selectedSide === "left" ? "ring-peach-500" : "ring-blue-400"
//             }`}
//             onClick={() => handleSelectSide("left")}
//           >
//             Left Side
//           </button>
//           <button
//             id="rightSideButton"
//             className={`side-button bg-purple-400 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-full shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//               selectedSide === "right" ? "ring-peach-500" : "ring-purple-400"
//             }`}
//             onClick={() => handleSelectSide("right")}
//           >
//             Right Side
//           </button>
//         </div>

//         <p id="selectedSide" className="text-lg font-medium text-gray-700 mb-4">
//           Side:{" "}
//           {selectedSide
//             ? selectedSide.charAt(0).toUpperCase() + selectedSide.slice(1)
//             : "Not Selected"}
//         </p>

//         <button
//           id="saveButton"
//           className="w-full bg-rose-500 hover:bg-peach-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
//           onClick={handleSaveSession}
//           disabled={isSaveDisabled}
//         >
//           Save Nursing Session
//         </button>
//         <p id="saveMessage" className="text-sm mt-2 text-red-500">
//           {saveMessage}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default NursingTimer;
