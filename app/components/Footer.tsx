"use client";

import { subtleText } from "../styles/designSystem";

export default function Footer() {
  const version = "v0.9.0"; // Update manually when releasing new versions
  const timestamp = new Date().toLocaleString("en-GB", {
    hour12: false,
  });

  return (
    <footer className="mt-10 pt-6 border-t border-neutral-800 text-center">
      <p className={subtleText}>
        HF Dashboard {version} • Last updated: {timestamp}
      </p>

      <p className={`${subtleText} mt-1`}>
        Built for HF operators — powered by live solar & ionospheric data
      </p>

      {/* Optional GitHub link */}
      <a
        href="https://github.com/YOUR_USERNAME/YOUR_REPO"
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-500 hover:text-neutral-300 text-sm underline mt-2 inline-block"
      >
        View source on GitHub
      </a>
    </footer>
  );
}