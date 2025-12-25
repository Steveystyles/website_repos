"use client"

import { Suspense } from "react"
import PlayerSearch from "@/components/football/PlayerSearch"
import OutputThreeSkeleton from "./OutputThreeSkeleton"

export default function OutputThree() {
  return (
    <Suspense fallback={<OutputThreeSkeleton />}>
      <PlayerSearch />
    </Suspense>
  )
}
