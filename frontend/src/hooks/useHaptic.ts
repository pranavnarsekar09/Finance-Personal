/**
 * Hook for triggering haptic feedback (vibration)
 * Provides cross-browser support with fallbacks
 */

export function useHaptic() {
  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn("Haptic feedback not supported:", error);
      }
    }
  };

  const light = () => vibrate(10);
  const medium = () => vibrate(20);
  const heavy = () => vibrate(30);
  const success = () => vibrate([10, 20, 10]); // double tap pattern
  const warning = () => vibrate([30, 10, 30]); // urgent pattern
  const error = () => vibrate([50, 20, 50, 20, 50]); // error pattern

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

/**
 * Trigger a simple haptic feedback immediately
 * Useful for imperative calls without needing the hook
 */
export function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn("Haptic feedback not supported:", error);
    }
  }
}

/**
 * Haptic feedback patterns for common UI interactions
 */
export const hapticPatterns = {
  tap: 10,
  select: [10, 20, 10],
  swipe: 15,
  success: [10, 20, 10],
  error: [50, 20, 50],
  warning: [30, 10, 30],
  longPress: [20, 30, 20],
} as const;
