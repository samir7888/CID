"use client";

import { useEffect, useRef, useCallback } from "react";
import type { InputAction } from "@/lib/game/types";

// ============================================================
// Mobile touch swipe detection.
// Threshold-based: prevents false positives on taps.
// Prevents page scroll while a game swipe is in progress.
// Shows a brief tutorial overlay on first visit.
// ============================================================

const SWIPE_THRESHOLD = 40; // px — minimum swipe distance to register

interface MobileControlsProps {
  onAction: (action: InputAction) => void;
  active: boolean; // only register gestures while game is playing
}

export default function MobileControls({ onAction, active }: MobileControlsProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      // Prevent page scroll while the player might be swiping
      if (touchStart.current && active) e.preventDefault();
    },
    [active]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStart.current || !active) {
        touchStart.current = null;
        return;
      }

      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      touchStart.current = null;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) return; // tap, ignore

      if (absDx > absDy) {
        // Horizontal swipe
        onAction(dx > 0 ? "right" : "left");
      } else {
        // Vertical swipe
        onAction(dy > 0 ? "slide" : "jump");
      }
    },
    [active, onAction]
  );

  const handleTouchCancel = useCallback(() => {
    touchStart.current = null;
  }, []);

  useEffect(() => {
    const el = document.body;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchCancel, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  return null;
}
