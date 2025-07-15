import { createClient } from "@supabase/supabase-js";

interface InitOptions {
  userId: string;
}

export function initNursingTimer({ userId }: InitOptions) {
  const supabaseClient = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL!,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY!
  );

  const timerDisplay = document.getElementById(
    "timerDisplay"
  ) as HTMLElement | null;
  const startButton = document.getElementById(
    "startButton"
  ) as HTMLButtonElement | null;
  const stopButton = document.getElementById(
    "stopButton"
  ) as HTMLButtonElement | null;
  const resetButton = document.getElementById(
    "resetButton"
  ) as HTMLButtonElement | null;
  const leftSideButton = document.getElementById(
    "leftSideButton"
  ) as HTMLButtonElement | null;
  const rightSideButton = document.getElementById(
    "rightSideButton"
  ) as HTMLButtonElement | null;
  const selectedSideDisplay = document.getElementById(
    "selectedSide"
  ) as HTMLElement | null;
  const saveButton = document.getElementById(
    "saveButton"
  ) as HTMLButtonElement | null;
  const saveMessage = document.getElementById(
    "saveMessage"
  ) as HTMLElement | null;

  let timerInterval: number;
  let seconds = 0;
  let selectedSide: string | null = null;
  let startTime: Date | null = null;
  let endTime: Date | null = null;

  function formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  function startTimer() {
    if (
      !startButton ||
      !stopButton ||
      !resetButton ||
      !saveButton ||
      !saveMessage ||
      !timerDisplay
    )
      return;

    startButton.disabled = true;
    stopButton.disabled = false;
    resetButton.disabled = true;
    saveButton.disabled = true;
    saveMessage.textContent = "";

    startTime = new Date();

    timerInterval = window.setInterval(() => {
      seconds++;
      if (timerDisplay) {
        timerDisplay.textContent = formatTime(seconds);
      }
    }, 1000);
  }

  function stopTimer() {
    if (!startButton || !stopButton || !resetButton || !saveButton) return;

    startButton.disabled = false;
    stopButton.disabled = true;
    resetButton.disabled = false;
    clearInterval(timerInterval);
    endTime = new Date();
    if (selectedSide && seconds > 0) saveButton.disabled = false;
  }

  function resetTimer() {
    if (
      !timerDisplay ||
      !resetButton ||
      !saveButton ||
      !selectedSideDisplay ||
      !leftSideButton ||
      !rightSideButton ||
      !saveMessage
    )
      return;

    stopTimer();
    seconds = 0;
    timerDisplay.textContent = formatTime(seconds);
    resetButton.disabled = true;
    saveButton.disabled = true;
    selectedSide = null;
    startTime = null;
    endTime = null;
    selectedSideDisplay.textContent = "Side: Not Selected";
    leftSideButton.classList.remove(
      "ring-2",
      "ring-offset-2",
      "ring-peach-500"
    );
    rightSideButton.classList.remove(
      "ring-2",
      "ring-offset-2",
      "ring-peach-500"
    );
    saveMessage.textContent = "";
  }

  function selectSide(side: string) {
    if (
      !selectedSideDisplay ||
      !leftSideButton ||
      !rightSideButton ||
      !saveButton
    )
      return;

    selectedSide = side;
    selectedSideDisplay.textContent = `Side: ${
      side.charAt(0).toUpperCase() + side.slice(1)
    }`;

    leftSideButton.classList.toggle("ring-2", side === "left");
    leftSideButton.classList.toggle("ring-offset-2", side === "left");
    rightSideButton.classList.toggle("ring-2", side === "right");
    rightSideButton.classList.toggle("ring-offset-2", side === "right");

    if (stopButton?.disabled && seconds > 0) saveButton.disabled = false;
  }

  startButton?.addEventListener("click", startTimer);
  stopButton?.addEventListener("click", stopTimer);
  resetButton?.addEventListener("click", resetTimer);
  leftSideButton?.addEventListener("click", () => selectSide("left"));
  rightSideButton?.addEventListener("click", () => selectSide("right"));

  saveButton?.addEventListener("click", async () => {
    if (!saveMessage || !saveButton) return;

    if (seconds === 0) {
      saveMessage.textContent =
        "Timer is at 0. Start and stop the timer before saving.";
      return;
    }
    if (!selectedSide) {
      saveMessage.textContent =
        "Please select a side (Left or Right) before saving.";
      return;
    }
    if (!startTime || !endTime) {
      saveMessage.textContent =
        "Timer was not started or stopped correctly. Please reset and try again.";
      return;
    }

    saveButton.disabled = true;
    saveMessage.textContent = "Saving session...";

    try {
      const { data, error } = await supabaseClient
        .from("nursing_sessions")
        .insert([
          {
            user_id: userId,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            duration_seconds: seconds,
            nursing_side: selectedSide,
          },
        ]);

      if (error) {
        saveMessage.textContent = `Error saving: ${error.message}`;
        saveButton.disabled = false;
      } else {
        saveMessage.textContent = "Session saved successfully!";
        resetTimer();
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (err: any) {
      saveMessage.textContent = `Unexpected error: ${err.message}`;
      saveButton.disabled = false;
    }
  });

  if (stopButton) stopButton.disabled = true;
  if (resetButton) resetButton.disabled = true;
  if (saveButton) saveButton.disabled = true;
}
