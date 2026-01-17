"use client";

import { useEffect, useState } from "react";

export default function ClientClock() {
  const [now, setNow] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);

    const update = () => {
      setNow(new Date().toLocaleString());
    };

    update();
    const id = setInterval(update, 1000);

    return () => clearInterval(id);
  }, []);

  if (!hydrated) {
    // Render identical markup on server and client
    return <span></span>;
  }

  return <span>{now}</span>;
}