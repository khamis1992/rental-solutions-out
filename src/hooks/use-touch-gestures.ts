
import { useEffect, RefObject } from "react";

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  minDistance?: number;
}

export function useTouchGestures(
  ref: RefObject<HTMLElement>, 
  options: TouchGestureOptions
) {
  const { 
    onSwipeLeft, 
    onSwipeRight, 
    onSwipeUp, 
    onSwipeDown, 
    minDistance = 50 
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches[0]) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      
      // Check if horizontal swipe is longer than vertical swipe
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > minDistance) {
          if (diffX > 0) {
            // Swipe left
            onSwipeLeft?.();
          } else {
            // Swipe right
            onSwipeRight?.();
          }
        }
      } else {
        if (Math.abs(diffY) > minDistance) {
          if (diffY > 0) {
            // Swipe up
            onSwipeUp?.();
          } else {
            // Swipe down
            onSwipeDown?.();
          }
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minDistance]);
}
