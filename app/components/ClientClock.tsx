"use client";

import { useEffect, useState } from "react";

export default function ClientClock() {
  const [now, setNow] = useState("");

  useEffect(() => {
    const update = () => {
      setNow(new Date().toLocaleString());
    };

    update();
    const id = setInterval(update, 1000);

    return () => clearInterval(id);
  }, []);

  return <span>{now}</span>;
}