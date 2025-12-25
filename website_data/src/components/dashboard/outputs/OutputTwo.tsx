"use client"

import { useEffect, useState } from "react"
import OutputTwoSkeleton from "./OutputTwoSkeleton"

export default function OutputTwo() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <OutputTwoSkeleton />

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-smfc-white">
        Output Two
      </h2>

      <p className="text-xs text-neutral-400">
        Placeholder data
      </p>

      <div className="rounded-lg border border-smfc-grey bg-smfc-black p-3">
        Item Alpha
      </div>
    </div>
  )
}
