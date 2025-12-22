export default function OutputTwo() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Output Two</h2>
      <p className="text-sm text-neutral-400">
        Placeholder content for output two
      </p>

      <ul className="space-y-2">
        {["Item Alpha", "Item Bravo", "Item Charlie"].map((item) => (
          <li
            key={item}
            className="rounded-lg bg-neutral-800 p-3 text-sm"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
