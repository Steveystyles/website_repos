import { OutputKey } from "@/app/(user)/page"

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
          onClick={() => onChange(btn.key)}
          className={`
            rounded-lg py-2 text-sm font-medium
            ${active === btn.key
              ? "bg-white text-black"
              : "bg-neutral-800 text-neutral-300"}
          `}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
