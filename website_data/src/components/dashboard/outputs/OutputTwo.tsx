"use client"

import { Suspense } from "react"
import MediaWatchlist from "./MediaWatchlist"
import OutputTwoSkeleton from "./OutputTwoSkeleton"

export default function OutputTwo() {
  return (
    <Suspense fallback={<OutputTwoSkeleton />}>
      <MediaWatchlist />
    </Suspense>
  )
}
