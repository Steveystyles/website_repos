import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json([
    {
      id: "scot-prem",
      name: "Scottish Premiership",
    },
    {
      id: "scot-champ",
      name: "Scottish Championship",
    },
  ])
}
