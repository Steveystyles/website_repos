import UserPage from "@/components/home/UserPage"

export default function PlaceholderOnePage() {
  return (
    <UserPage
      title="Overview"
      description="This page is reserved for your overview dashboard. Swap in API-driven content when ready."
      eyebrow="Placeholder"
    >
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-sm font-semibold text-slate-200">Snapshot</h2>
          <p className="mt-3 text-sm text-slate-400">
            Highlight the KPIs and system health updates that matter most to your users.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-sm font-semibold text-slate-200">Upcoming Tasks</h2>
          <p className="mt-3 text-sm text-slate-400">
            List scheduled jobs, reminders, or queued notifications here.
          </p>
        </div>
      </section>
    </UserPage>
  )
}
