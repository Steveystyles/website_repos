type OmdbSearchItem = {
  imdbID: string
  Title: string
  Year: string
  Type: string
  Poster?: string
}

type OmdbSearchResponse = {
  Search?: OmdbSearchItem[]
  Response: "True" | "False"
  Error?: string
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")?.trim()

  if (!query) {
    return Response.json(
      { error: "Please provide a movie title to search." },
      { status: 400 }
    )
  }

  const apiKey = process.env.OMDB_API_KEY

  if (!apiKey) {
    return Response.json(
      {
        error:
          "OMDB_API_KEY is not set. Add your OMDb API key to the environment to enable movie search.",
      },
      { status: 500 }
    )
  }

  const url = `https://www.omdbapi.com/?apikey=${apiKey}&type=movie&s=${encodeURIComponent(query)}`

  try {
    const res = await fetch(url, { cache: "no-store" })

    if (!res.ok) {
      return Response.json(
        { error: "Unable to reach OMDb right now. Please try again soon." },
        { status: 502 }
      )
    }

    const data = (await res.json()) as OmdbSearchResponse

    if (data.Response === "False" || !Array.isArray(data.Search)) {
      return Response.json({ results: [], message: data.Error ?? "No matches found." })
    }

    const results = data.Search.map((item) => ({
      id: item.imdbID,
      title: item.Title,
      year: item.Year,
      type: item.Type,
      poster: item.Poster && item.Poster !== "N/A" ? item.Poster : null,
    }))

    return Response.json({ results })
  } catch (error) {
    console.error("Failed to search movies", error)
    return Response.json(
      { error: "Movie search failed. Please try again." },
      { status: 500 }
    )
  }
}
