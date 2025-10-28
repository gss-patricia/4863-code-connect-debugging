"use client";

import { useState, useEffect } from "react";
import { useFeatureValue } from "@growthbook/growthbook-react";

export const LastUpdateTime = () => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const showTime = useFeatureValue("show-update-time", false); // default: mostra

  useEffect(() => {
    const now = new Date();
    setDate(now.toLocaleDateString("pt-BR"));
    setTime(now.toLocaleTimeString("pt-BR"));
  }, []);

  if (!date) return <time>carregando...</time>;

  return (
    <time>
      {date}
      {showTime && <> às {time}</>}
    </time>
  );
};
