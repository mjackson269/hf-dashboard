"use client";

import { useEffect, useState } from "react";

export default function ClientClock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setNow(
        new Date().toLocaleString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;

  return <span suppressHydrationWarning>{now}</span>;
}