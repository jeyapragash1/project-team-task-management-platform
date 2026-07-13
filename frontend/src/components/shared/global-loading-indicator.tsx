"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const active = isFetching + isMutating > 0;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 overflow-hidden bg-transparent"
      aria-hidden={!active}
    >
      <div
        className={
          active
            ? "h-full w-1/3 animate-pulse bg-primary transition-opacity"
            : "h-full w-1/3 bg-primary opacity-0 transition-opacity"
        }
      />
    </div>
  );
}
