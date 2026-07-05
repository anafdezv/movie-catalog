import type { MovieSummary } from "@/types/movie";

const MOVIE_METADATA: Record<
  string,
  {
    duration: string;
    seatTag: string;
  }
> = {
  "Blade Runner 2049": {
    duration: "2h 44m",
    seatTag: "Seat 7A"
  },
  Arrival: {
    duration: "1h 56m",
    seatTag: "Seat 14C"
  },
  Dune: {
    duration: "2h 35m",
    seatTag: "Seat 2F"
  },
  "The Grand Budapest Hotel": {
    duration: "1h 39m",
    seatTag: "Seat 3D"
  },
  "Spirited Away": {
    duration: "2h 05m",
    seatTag: "Seat 11B"
  },
  Halloween: {
    duration: "1h 31m",
    seatTag: "Seat 13A"
  },
  "Friday the 13th": {
    duration: "1h 35m",
    seatTag: "Seat 13C"
  },
  "A Nightmare on Elm Street": {
    duration: "1h 31m",
    seatTag: "Seat 13F"
  },
  Scream: {
    duration: "1h 51m",
    seatTag: "Seat 9D"
  },
  "The Simpsons Movie": {
    duration: "1h 27m",
    seatTag: "Seat 4B"
  },
  "Pulp Fiction": {
    duration: "2h 34m",
    seatTag: "Seat 8A"
  },
  "Kill Bill: Volume 1": {
    duration: "1h 51m",
    seatTag: "Seat 5E"
  }
};

const defaultMeta = {
  duration: "1h 45m",
  seatTag: "Seat 3C"
};

export const MOVIE_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Family",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Slasher",
  "Thriller"
] as const;

export const altitudeSkyImage =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80";

export function getMovieMeta(movie: Pick<MovieSummary, "title" | "genre" | "year">) {
  const metadata = MOVIE_METADATA[movie.title] ?? defaultMeta;

  return {
    genre: movie.genre,
    year: String(movie.year),
    duration: metadata.duration,
    seatTag: metadata.seatTag
  };
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
  const genres = Array.from(new Set(movies.map((movie) => movie.genre)));
  return ["All", ...genres];
}

export function getMovieYearOptions(currentYear = new Date().getFullYear()) {
  return Array.from({ length: currentYear - 1949 }, (_, index) => currentYear - index);
}
