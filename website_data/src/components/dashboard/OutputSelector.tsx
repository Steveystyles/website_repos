import { OutputKey } from "@/app/(user)/page"
import OutputOne from "./outputs/OutputOne"
import OutputTwo from "./outputs/OutputTwo"
import OutputThree from "./outputs/OutputThree"
import OutputFour from "./outputs/OutputFour"

export default function OutputContainer({ active }: { active: OutputKey }) {
  return (
    <section className="rounded-xl bg-neutral-900 p-4 min-h-[300px]">
      {active === "one" && <OutputOne />}
      {active === "two" && <OutputTwo />}
      {active === "three" && <OutputThree />}
      {active === "four" && <OutputFour />}
    </section>
  )
}
