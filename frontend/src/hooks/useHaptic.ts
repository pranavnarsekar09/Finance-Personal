/**
 * Hook for triggering haptic feedback (vibration)
 * Keeps feedback light and avoids spamming the device with overlapping calls.
 */

const MIN_VIBRATION_GAP_MS = 80;
let lastVibrationAt = 0;

function canVibrate() {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function performVibration(pattern: number | number[] = 10) {
  if (!canVibrate()) {
    return false;
  }

  const now = Date.now();
  if (now - lastVibrationAt < MIN_VIBRATION_GAP_MS) {
    return false;
  }

  lastVibrationAt = now;

  try {
    return navigator.vibrate(pattern);
  } catch (error) {
    console.warn("Haptic feedback not supported:", error);
    return false;
  }
}

export function useHaptic() {
  const vibrate = (pattern: number | number[] = 10) => {
    // Run on the next frame so it stays tied to the completed swipe/tab change.
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        performVibration(pattern);
      });
      return;
    }

    performVibration(pattern);
  };

  const light = () => vibrate(10);
  const medium = () => vibrate(20);
  const heavy = () => vibrate(30);
  const success = () => vibrate([10, 20, 10]);
  const warning = () => vibrate([30, 10, 30]);
  const error = () => vibrate([50, 20, 50, 20, 50]);

  return {
    vibrate,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
  };
}

export function triggerHaptic(pattern: number | number[] = 10) {
  performVibration(pattern);
}

export const hapticPatterns = {
  tap: 10,
  select: [10, 20, 10],
  swipe: 15,
  success: [10, 20, 10],
  error: [50, 20, 50],
  warning: [30, 10, 30],
  longPress: [20, 30, 20],
} as const;
