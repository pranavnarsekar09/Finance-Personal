import { useEffect, useRef } from "react";

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // minimum distance in pixels
  ignoreSelector?: string;
}

const shouldIgnoreSwipe = (target: EventTarget | null, ignoreSelector?: string) => {
  if (!ignoreSelector || !(target instanceof Element)) {
    return false;
  }

  let element: Element | null = target;
  while (element) {
    if (element.matches(ignoreSelector)) {
      return true;
    }
    element = element.parentElement;
  }

  return false;
};

/**
 * Hook for detecting left/right swipe gestures
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  ignoreSelector,
}: UseSwipeOptions) {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const ignoreSwipe = useRef(false);

  const handleTouchStart = (e: TouchEvent) => {
    ignoreSwipe.current = shouldIgnoreSwipe(e.target, ignoreSelector);
    if (ignoreSwipe.current) return;
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (ignoreSwipe.current) {
      ignoreSwipe.current = false;
      return;
    }
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    } else if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  useEffect(() => {
    const element = document.querySelector("body");
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, ignoreSelector]);
}

/**
 * Hook for browser-based swipe detection with mouse fallback
 */
export function useSwipeNative({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  ignoreSelector,
}: UseSwipeOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const isMouseDown = useRef(false);
  const ignoreSwipe = useRef(false);

  const handleStart = (x: number, y: number, target?: EventTarget | null) => {
    ignoreSwipe.current = shouldIgnoreSwipe(target, ignoreSelector);
    if (ignoreSwipe.current) {
      return;
    }

    startX.current = x;
    startY.current = y;
    isMouseDown.current = true;
  };

  const handleEnd = (x: number, y: number) => {
    if (!isMouseDown.current || ignoreSwipe.current) {
      ignoreSwipe.current = false;
      isMouseDown.current = false;
      return;
    }
    isMouseDown.current = false;

    const distX = startX.current - x;
    const distY = startY.current - y;

    // Only trigger if vertical movement is minimal (swiping, not scrolling)
    if (Math.abs(distY) > Math.abs(distX)) return;

    if (distX > threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (distX < -threshold && onSwipeRight) {
      onSwipeRight();
    }
  };

  useEffect(() => {
    const element = document.querySelector("body");
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY, e.target);
    const handleMouseUp = (e: MouseEvent) => handleEnd(e.clientX, e.clientY);
    const handleTouchStart = (e: TouchEvent) =>
      handleStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
    const handleTouchEnd = (e: TouchEvent) =>
      handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);

    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("mouseup", handleMouseUp);
    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("mouseup", handleMouseUp);
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, ignoreSelector]);
}
