export default function OutputFour() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Output Four</h2>
      <p className="text-sm text-neutral-400">
        Placeholder status view
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg bg-neutral-800 p-3">
          <span className="text-sm">Service A</span>
          <span className="text-xs text-green-400">OK</span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-neutral-800 p-3">
          <span className="text-sm">Service B</span>
          <span className="text-xs text-yellow-400">WARN</span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-neutral-800 p-3">
          <span className="text-sm">Service C</span>
          <span className="text-xs text-red-400">DOWN</span>
        </div>
      </div>
    </div>
  )
}
