import UserPage from "@/components/home/UserPage"
import OutputSwitcher from "@/components/home/OutputSwitcher"

export default function Home() {
  return (
    <UserPage
      title="Screen outputs"
      description="Switch between four placeholder layouts for each display output."
      eyebrow="Splash"
    >
      <OutputSwitcher />
    </UserPage>
  )
}
