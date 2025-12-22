"use client"

import { useState } from "react"
import OutputSelector from "./OutputSelector"
import OutputContainer from "./OutputContainer"

export type OutputKey = "one" | "two" | "three" | "four"

export default function DashboardClient() {
  const [active, setActive] = useState<OutputKey>("one")

  return (
    <div className="flex flex-col gap-4 p-4">
      <OutputSelector active={active} onChange={setActive} />
      <OutputContainer active={active} />
    </div>
  )
}
