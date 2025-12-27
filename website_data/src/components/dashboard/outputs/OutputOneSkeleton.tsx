import { Skeleton } from "@/components/ui/Skeleton"

export default function OutputOneSkeleton() {
  return (
    <div className="space-y-4 h-full">
      <Skeleton className="h-12 w-full rounded-xl" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>

      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
