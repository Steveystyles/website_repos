export default function OutputThree() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Output Three</h2>
      <p className="text-sm text-neutral-400">
        Placeholder grid layout
      </p>

      <div className="grid grid-cols-2 gap-3">
        {["Card 1", "Card 2", "Card 3", "Card 4"].map((card) => (
          <div
            key={card}
            className="rounded-lg bg-neutral-800 p-4 text-center text-sm"
          >
            {card}
          </div>
        ))}
      </div>
    </div>
  )
}
