import UserPage from "@/components/home/UserPage"

export default function Home() {
  return (
    <UserPage
      title={(userEmail) => `Welcome back, ${userEmail}`}
      description="This is your user-level workspace. API-powered data will live here soon—right now you can use the layout to plan dashboards, reports, and alerts."
    >
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {["Active Projects", "API Status", "Recent Activity"].map((title) => (
          <div
            key={title}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">
                Placeholder
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-2 w-full rounded-full bg-slate-800">
                <div className="h-2 w-2/3 rounded-full bg-indigo-500/80" />
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                <p>Connect your APIs to replace these metrics.</p>
                <p>Track trends, alerts, and engagement in real time.</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-200">
            Placeholder canvas for your main content
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Drop in charts, tables, and API-driven widgets here once they are ready.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-left">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Next step
              </p>
              <p className="mt-2 text-sm text-slate-200">Wire up endpoint data.</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-left">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Reminder
              </p>
              <p className="mt-2 text-sm text-slate-200">
                Add filters and context once endpoints are available.
              </p>
            </div>
          </div>
        </div>
      </section>
    </UserPage>
  )
}
