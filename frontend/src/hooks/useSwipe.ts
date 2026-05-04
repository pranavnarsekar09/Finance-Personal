import { useEffect, useRef } from "react";

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  ignoreSelector?: string;
  scopeSelector?: string;
}

const VERTICAL_SCROLL_TOLERANCE = 24;
const HORIZONTAL_INTENT_RATIO = 1.2;

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

export function useSwipe(options: UseSwipeOptions) {
  useSwipeNative(options);
}

export function useSwipeNative({
  onSwipeLeft,
  onSwipeRight,
  threshold = 44,
  ignoreSelector,
  scopeSelector = "[data-swipe-scope='true']",
}: UseSwipeOptions) {
  const callbacksRef = useRef({ onSwipeLeft, onSwipeRight, threshold, ignoreSelector, scopeSelector });
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    active: false,
    ignore: false,
  });

  callbacksRef.current = { onSwipeLeft, onSwipeRight, threshold, ignoreSelector, scopeSelector };

  useEffect(() => {
    const element = document.querySelector(scopeSelector) ?? document.body;
    if (!element) return;

    const startGesture = (x: number, y: number, target?: EventTarget | null) => {
      const { ignoreSelector: currentIgnoreSelector } = callbacksRef.current;
      const ignore = shouldIgnoreSwipe(target, currentIgnoreSelector);

      gestureRef.current = {
        startX: x,
        startY: y,
        lastX: x,
        lastY: y,
        active: !ignore,
        ignore,
      };
    };

    const moveGesture = (x: number, y: number) => {
      if (!gestureRef.current.active) {
        return;
      }

      gestureRef.current.lastX = x;
      gestureRef.current.lastY = y;
    };

    const endGesture = (x?: number, y?: number) => {
      const current = gestureRef.current;
      if (!current.active || current.ignore) {
        gestureRef.current.active = false;
        gestureRef.current.ignore = false;
        return;
      }

      const endX = x ?? current.lastX;
      const endY = y ?? current.lastY;
      const distX = current.startX - endX;
      const distY = current.startY - endY;
      const absX = Math.abs(distX);
      const absY = Math.abs(distY);

      gestureRef.current.active = false;
      gestureRef.current.ignore = false;

      if (absY > VERTICAL_SCROLL_TOLERANCE && absY > absX * HORIZONTAL_INTENT_RATIO) {
        return;
      }

      const { onSwipeLeft: left, onSwipeRight: right, threshold: currentThreshold } = callbacksRef.current;
      if (distX > currentThreshold && left) {
        left();
      } else if (distX < -currentThreshold && right) {
        right();
      }
    };

    const cancelGesture = () => {
      gestureRef.current.active = false;
      gestureRef.current.ignore = false;
    };

    const handleMouseDown = (e: MouseEvent) => startGesture(e.clientX, e.clientY, e.target);
    const handleMouseMove = (e: MouseEvent) => moveGesture(e.clientX, e.clientY);
    const handleMouseUp = (e: MouseEvent) => endGesture(e.clientX, e.clientY);

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        cancelGesture();
        return;
      }

      startGesture(e.touches[0].clientX, e.touches[0].clientY, e.target);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        cancelGesture();
        return;
      }

      moveGesture(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) {
        endGesture();
        return;
      }

      endGesture(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    };

    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseup", handleMouseUp);
    element.addEventListener("mouseleave", cancelGesture);
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });
    element.addEventListener("touchcancel", cancelGesture, { passive: true });

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseup", handleMouseUp);
      element.removeEventListener("mouseleave", cancelGesture);
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", cancelGesture);
    };
  }, [scopeSelector]);
}
