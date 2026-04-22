"use client";

import { Toaster } from "react-hot-toast";

export function HotToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className:
          "!bg-surface-container-lowest !text-on-surface !border !border-outline-variant/20 !rounded-xl !shadow-lg",
      }}
    />
  );
}
