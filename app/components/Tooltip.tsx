"use client";

import { useState } from "react";

export default function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="ml-2 text-neutral-400 hover:text-white"
        aria-label="Why this band"
      >
        ⓘ
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 p-3 rounded-lg bg-neutral-800 text-sm text-neutral-200 shadow-lg z-50">
          {text}
        </div>
      )}
    </span>
  );
}