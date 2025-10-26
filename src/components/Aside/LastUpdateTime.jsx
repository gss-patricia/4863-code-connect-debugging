"use client"

import { useState, useEffect } from "react"

export const LastUpdateTime = () => {
  const [time, setTime] = useState("")

  useEffect(() => {
    setTime(new Date().toLocaleString("pt-BR"))
  }, [])

  return <time>{time || "carregando..."}</time>
}
