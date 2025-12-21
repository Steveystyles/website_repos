"use client"

import { useMemo, useState } from "react"

const outputs = [
  {
    key: "outputOne",
    label: "Output One",
    title: "Output One",
    description:
      "A focused placeholder view for your first display output or screen.",
    tiles: ["Feed A", "Feed B", "Feed C", "Feed D"],
  },
  {
    key: "outputTwo",
    label: "Output Two",
    title: "Output Two",
    description:
      "Second screen space for operational metrics and quick-glance updates.",
    tiles: ["Ops Snapshot", "Queue Health", "SLA Watch", "Incident Loop"],
  },
  {
    key: "outputThree",
    label: "Output Three",
    title: "Output Three",
    description:
      "Collaborative space for team-facing information and announcements.",
    tiles: ["Announcements", "Team Goals", "Upcoming Events", "Shift Notes"],
  },
  {
    key: "outputFour",
    label: "Output Four",
    title: "Output Four",
    description:
      "A configuration-friendly layout for settings, tooling, or escalation.",
    tiles: ["Config Panel", "Escalation", "Playbooks", "Integrations"],
  },
]

export default function OutputSwitcher() {
  const [activeKey, setActiveKey] = useState(outputs[0].key)

  const activeView = useMemo(
    () => outputs.find((output) => output.key === activeKey) ?? outputs[0],
    [activeKey]
  )

  return (
    <section className="mt-6 space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Screen outputs
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist">
          {outputs.map((view) => {
            const isActive = view.key === activeKey
            return (
              <button
                key={view.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${view.key}-panel`}
                onClick={() => setActiveKey(view.key)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 ${
                  isActive
                    ? "border-sky-400/70 bg-sky-500/20 text-sky-100 shadow-[0_0_18px_rgba(56,189,248,0.35)]"
                    : "border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                {view.label}
              </button>
            )
          })}
        </div>
      </div>

      <div
        id={`${activeView.key}-panel`}
        role="tabpanel"
        className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              {activeView.title}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-100 sm:text-2xl">
              {activeView.title} workspace
            </h2>
          </div>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
            4-screen placeholder output
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">
          {activeView.description}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {activeView.tiles.map((title) => (
            <div
              key={title}
              className="rounded-xl border border-slate-800/90 bg-slate-950/40 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">
                  Placeholder
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Reserve this slot for analytics, alerts, or a live status tile.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
