import Link from "next/link"
import UserPage from "@/components/home/UserPage"

type HomePageProps = {
  searchParams?: {
    view?: string
  }
}

const viewConfig = {
  overview: {
    label: "Overview",
    title: "Overview",
    description:
      "A compact snapshot of the dashboards and alerts you want to highlight.",
    content: (
      <div className="grid gap-4 lg:grid-cols-2">
        {["Snapshot", "Upcoming Tasks", "Alerts"].map((title) => (
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
              Use this card to surface KPIs, trends, or the latest system health
              updates.
            </p>
          </div>
        ))}
      </div>
    ),
  },
  reports: {
    label: "Reports",
    title: "Reports",
    description:
      "Quick access to scheduled exports and reporting workflows in one view.",
    content: (
      <div className="grid gap-4 lg:grid-cols-3">
        {["Weekly Digest", "Quarterly Review", "Custom Exports"].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <h2 className="text-sm font-semibold text-slate-200">{label}</h2>
            <p className="mt-3 text-sm text-slate-400">
              Swap in filters, scheduling, and export actions when ready.
            </p>
          </div>
        ))}
      </div>
    ),
  },
  team: {
    label: "Team",
    title: "Team",
    description:
      "Member management and invitations can live here once you wire up APIs.",
    content: (
      <div className="grid gap-4 lg:grid-cols-2">
        {["Members", "Invitations"].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <h2 className="text-sm font-semibold text-slate-200">{label}</h2>
            <p className="mt-3 text-sm text-slate-400">
              Add roles, permissions, and request workflows here.
            </p>
          </div>
        ))}
      </div>
    ),
  },
  settings: {
    label: "Settings",
    title: "Settings",
    description:
      "Organize preference panels, billing, and notifications in this space.",
    content: (
      <div className="grid gap-4 lg:grid-cols-3">
        {["Profile", "Notifications", "Billing"].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <h2 className="text-sm font-semibold text-slate-200">{label}</h2>
            <p className="mt-3 text-sm text-slate-400">
              Placeholder controls for {label.toLowerCase()} settings.
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
      : "overview"
  const activeView = viewConfig[activeKey]

  return (
    <UserPage
      title={activeView.title}
      description={activeView.description}
      eyebrow="Splash"
    >
      <section className="mt-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          {Object.entries(viewConfig).map(([key, view]) => {
            const isActive = key === activeKey
            return (
              <Link
                key={key}
                href={`/?view=${key}`}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  isActive
                    ? "border-sky-400/70 bg-sky-500/20 text-sky-200"
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
              Placeholder view
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
