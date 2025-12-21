import { Suspense } from "react"
import LoginErrorContent from "./LoginErrorContent"

export default function LoginErrorPage() {
  return (
    <Suspense>
      <LoginErrorContent />
    </Suspense>
  )
}
