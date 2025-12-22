import { OutputKey } from "./DashboardClient"

type Props = {
  active: OutputKey
  onChange: (key: OutputKey) => void
}

const buttons: { key: OutputKey; label: string }[] = [
  { key: "one", label: "Output 1" },
  { key: "two", label: "Output 2" },
  { key: "three", label: "Output 3" },
  { key: "four", label: "Output 4" },
]

export default function OutputSelector({ active, onChange }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {buttons.map((btn) => (
        <button
          key={btn.key}
          type="button"
          onClick={() => onChange(btn.key)}
          className={
            active === btn.key
              ? "bg-white text-black rounded-lg py-2"
              : "bg-neutral-800 text-neutral-300 rounded-lg py-2"
          }
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
