import { redirect } from "next/navigation"

export default function PlaceholderOnePage() {
  redirect("/?view=overview")
}
