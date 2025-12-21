import Link from "next/link"
import UserPage from "@/components/home/UserPage"

type HomePageProps = {
  searchParams?: {
    view?: string
  }
}

const viewConfig = {
  outputOne: {
    label: "Output One",
    title: "Output One",
    description:
      "A focused placeholder view for your first display output or screen.",
    content: (
      <div className="grid gap-4 lg:grid-cols-2">
        {["Feed A", "Feed B", "Feed C", "Feed D"].map((title) => (
          <div
            key={title}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
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
    ),
  },
  outputTwo: {
    label: "Output Two",
    title: "Output Two",
    description:
      "Second screen space for operational metrics and quick-glance updates.",
    content: (
      <div className="grid gap-4 lg:grid-cols-3">
        {["Operational Pulse", "Queue Health", "SLA Watch"].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <h2 className="text-sm font-semibold text-slate-200">{label}</h2>
            <p className="mt-3 text-sm text-slate-400">
              Drop in charts, counters, or system summaries when ready.
            </p>
          </div>
        ))}
      </div>
    ),
  },
  outputThree: {
    label: "Output Three",
    title: "Output Three",
    description:
      "Collaborative space for team-facing information and announcements.",
    content: (
      <div className="grid gap-4 lg:grid-cols-2">
        {["Announcements", "Team Goals", "Upcoming Events"].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <h2 className="text-sm font-semibold text-slate-200">{label}</h2>
            <p className="mt-3 text-sm text-slate-400">
              Share daily priorities, highlights, or recognition here.
            </p>
          </div>
        ))}
      </div>
    ),
  },
  outputFour: {
    label: "Output Four",
    title: "Output Four",
    description:
      "A configuration-friendly layout for settings, tooling, or escalation.",
    content: (
      <div className="grid gap-4 lg:grid-cols-3">
        {["Config Panel", "Escalation", "Playbooks"].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <h2 className="text-sm font-semibold text-slate-200">{label}</h2>
            <p className="mt-3 text-sm text-slate-400">
              Placeholder controls for {label.toLowerCase()} workflows.
            </p>
          </div>
        ))}
      </div>
    ),
  },
}

export default function Home({ searchParams }: HomePageProps) {
  const activeKey =
    searchParams?.view && searchParams.view in viewConfig
      ? (searchParams.view as keyof typeof viewConfig)
      : "outputOne"
  const activeView = viewConfig[activeKey]

  return (
    <UserPage
      title={activeView.title}
      description={activeView.description}
      eyebrow="Splash"
    >
      <section className="mt-6 space-y-6">
        <div className="flex flex-wrap gap-2" role="tablist">
          {Object.entries(viewConfig).map(([key, view]) => {
            const isActive = key === activeKey
            return (
              <Link
                key={key}
                href={`/?view=${key}`}
                role="tab"
                aria-selected={isActive}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  isActive
                    ? "border-sky-400/70 bg-sky-500/20 text-sky-100 shadow-[0_0_18px_rgba(56,189,248,0.35)]"
                    : "border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                {view.label}
              </Link>
            )
          })}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                {activeView.title}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-100">
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
          <div className="mt-6">{activeView.content}</div>
        </div>
      </section>
    </UserPage>
  )
}
