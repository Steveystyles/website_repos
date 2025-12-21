import UserPage from "@/components/home/UserPage"

export default function PlaceholderThreePage() {
  return (
    <UserPage
      title="Team"
      description="Use this space for team management, invitations, and activity logs."
      eyebrow="Placeholder"
    >
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-sm font-semibold text-slate-200">Members</h2>
          <p className="mt-3 text-sm text-slate-400">
            Add member lists and roles once the data is available.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-sm font-semibold text-slate-200">Invitations</h2>
          <p className="mt-3 text-sm text-slate-400">
            Reserve space for invite workflows and access requests.
          </p>
        </div>
      </section>
    </UserPage>
  )
}
