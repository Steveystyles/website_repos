"use client"

import { useState } from "react"
import OutputSelector from "@/components/dashboard/OutputSelector"
import OutputContainer from "@/components/dashboard/OutputContainer"

export type OutputKey = "one" | "two" | "three" | "four"

export default function DashboardPage() {
  const [active, setActive] = useState<OutputKey>("one")

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="text-center">
        <h1 className="text-xl font-semibold">Fultons Movies</h1>
        <p className="text-sm text-neutral-400">Live dashboard</p>
      </header>

      <OutputSelector active={active} onChange={setActive} />
      <OutputContainer active={active} />
    </div>
  )
}
