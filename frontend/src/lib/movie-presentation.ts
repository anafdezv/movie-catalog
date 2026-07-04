import type { MovieSummary } from "@/types/movie";

const MOVIE_METADATA: Record<
  string,
  {
    genre: string;
    year: string;
    duration: string;
    seatTag: string;
  }
> = {
  "Blade Runner 2049": {
    genre: "Sci-Fi",
    year: "2017",
    duration: "2h 44m",
    seatTag: "Seat 7A"
  },
  Arrival: {
    genre: "Sci-Fi",
    year: "2016",
    duration: "1h 56m",
    seatTag: "Seat 14C"
  },
  Dune: {
    genre: "Sci-Fi",
    year: "2021",
    duration: "2h 35m",
    seatTag: "Seat 2F"
  },
  "The Grand Budapest Hotel": {
    genre: "Comedy",
    year: "2014",
    duration: "1h 39m",
    seatTag: "Seat 3D"
  },
  "Spirited Away": {
    genre: "Fantasy",
    year: "2001",
    duration: "2h 05m",
    seatTag: "Seat 11B"
  },
  Halloween: {
    genre: "Slasher",
    year: "1978",
    duration: "1h 31m",
    seatTag: "Seat 13A"
  },
  "Friday the 13th": {
    genre: "Slasher",
    year: "1980",
    duration: "1h 35m",
    seatTag: "Seat 13C"
  },
  "A Nightmare on Elm Street": {
    genre: "Slasher",
    year: "1984",
    duration: "1h 31m",
    seatTag: "Seat 13F"
  },
  Scream: {
    genre: "Slasher",
    year: "1996",
    duration: "1h 51m",
    seatTag: "Seat 9D"
  },
  "The Simpsons Movie": {
    genre: "Animation",
    year: "2007",
    duration: "1h 27m",
    seatTag: "Seat 4B"
  },
  "Pulp Fiction": {
    genre: "Crime",
    year: "1994",
    duration: "2h 34m",
    seatTag: "Seat 8A"
  },
  "Kill Bill: Volume 1": {
    genre: "Action",
    year: "2003",
    duration: "1h 51m",
    seatTag: "Seat 5E"
  }
};

const defaultMeta = {
  genre: "Film",
  year: "2024",
  duration: "1h 45m",
  seatTag: "Seat 3C"
};

export const altitudeSkyImage =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80";

export function getMovieMeta(movie: Pick<MovieSummary, "title">) {
  return MOVIE_METADATA[movie.title] ?? defaultMeta;
}

export function getMovieRankLabel(id: number) {
  return `#${String(id).padStart(2, "0")}`;
}

export function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
}

export function getFeaturedMovie(movies: MovieSummary[]) {
  return [...movies].sort((left, right) => {
    const leftScore = left.avgRating ?? 0;
    const rightScore = right.avgRating ?? 0;

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return left.id - right.id;
  })[0] ?? null;
}

export function getGenreOptions(movies: MovieSummary[]) {
  const genres = Array.from(new Set(movies.map((movie) => getMovieMeta(movie).genre)));
  return ["All", ...genres];
}
