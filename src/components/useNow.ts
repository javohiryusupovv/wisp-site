"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Current time, ticking every `every` ms. Server render and hydration use `serverNow`
 * so the first client render matches the HTML.
 */
export function useNow(serverNow: number, every = 1000) {
  const subscribe = useCallback(
    (onTick: () => void) => {
      const id = window.setInterval(onTick, every);
      return () => window.clearInterval(id);
    },
    [every],
  );
  // rounded down to the tick so the snapshot stays stable between ticks
  return useSyncExternalStore(subscribe, () => Math.floor(Date.now() / every) * every, () => serverNow);
}
