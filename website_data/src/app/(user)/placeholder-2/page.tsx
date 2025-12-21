import UserPage from "@/components/home/UserPage"

export default function PlaceholderTwoPage() {
  return (
    <UserPage
      title="Reports"
      description="This placeholder page can house report summaries and export controls."
      eyebrow="Placeholder"
    >
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {["Weekly Digest", "Quarterly Review", "Custom Exports"].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <h2 className="text-sm font-semibold text-slate-200">{label}</h2>
            <p className="mt-3 text-sm text-slate-400">
              Add filters, date ranges, and export actions when your APIs are ready.
            </p>
          </div>
        ))}
      </section>
    </UserPage>
  )
}
