import UserPage from "@/components/home/UserPage"

export default function PlaceholderFourPage() {
  return (
    <UserPage
      title="Settings"
      description="Add configuration panels, billing settings, or user preferences here."
      eyebrow="Placeholder"
    >
      <section className="mt-8 space-y-4">
        {["Profile", "Notifications", "Billing"].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <h2 className="text-sm font-semibold text-slate-200">{label}</h2>
            <p className="mt-2 text-sm text-slate-400">
              Placeholder controls for {label.toLowerCase()} settings.
            </p>
          </div>
        ))}
      </section>
    </UserPage>
  )
}
