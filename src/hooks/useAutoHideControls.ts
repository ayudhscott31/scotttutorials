import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_HIDE_MS = 2500;

export function useAutoHideControls(isActive: boolean, hideDelayMs = DEFAULT_HIDE_MS) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const clearHideTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    if (!isActive) return;
    timerRef.current = setTimeout(() => setVisible(false), hideDelayMs);
  }, [clearHideTimer, hideDelayMs, isActive]);

  const showControls = useCallback(() => {
    setVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    if (isActive) {
      setVisible(true);
      scheduleHide();
    } else {
      setVisible(true);
      clearHideTimer();
    }
    return clearHideTimer;
  }, [isActive, scheduleHide, clearHideTimer]);

  const onSurfaceTap = useCallback(() => {
    if (visible) {
      setVisible(false);
      clearHideTimer();
    } else {
      showControls();
    }
  }, [visible, clearHideTimer, showControls]);

  const keepControlsVisible = useCallback(() => {
    showControls();
  }, [showControls]);

  return {
    controlsVisible: visible,
    showControls,
    onSurfaceTap,
    keepControlsVisible,
  };
}
