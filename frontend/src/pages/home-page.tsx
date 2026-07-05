import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "@/api/client";
import { FeedbackState } from "@/components/feedback/feedback-state";
import { BrandMark } from "@/components/layout/brand-mark";
import { getMovies } from "@/api/movies";
import { MovieCard } from "@/components/movies/movie-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  altitudeSkyImage,
  getFeaturedMovie,
  getGenreOptions,
  getMovieMeta
} from "@/lib/movie-presentation";
import type { MovieSummary } from "@/types/movie";

export function HomePage() {
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");

  const loadMovies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getMovies();
      setMovies(response);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Could not load the films."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    loadMovies()
      .then(() => {
        if (!isActive) {
          return;
        }
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  const featuredMovie = useMemo(() => getFeaturedMovie(movies), [movies]);
  const genreOptions = useMemo(() => getGenreOptions(movies), [movies]);
  const filteredMovies = useMemo(
    () =>
      movies.filter((movie) => {
        const matchesGenre = activeGenre === "All" || getMovieMeta(movie).genre === activeGenre;
        const normalizedSearch = search.trim().toLowerCase();
        const matchesSearch =
          normalizedSearch.length === 0 ||
          movie.title.toLowerCase().includes(normalizedSearch) ||
          movie.synopsis.toLowerCase().includes(normalizedSearch) ||
          getMovieMeta(movie).genre.toLowerCase().includes(normalizedSearch);

        return matchesGenre && matchesSearch;
      }),
    [activeGenre, movies, search]
  );

  return (
    <div>
      <section
        className="relative min-h-[720px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(7,16,25,0.9) 0%, rgba(7,16,25,0.55) 46%, rgba(7,16,25,0.38) 100%), url(${altitudeSkyImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent via-[#071019]/55 to-[#071019]" />
        <div className="altitude-shell flex min-h-[720px] items-center">
          <div className="max-w-3xl space-y-7 py-16 sm:py-18 lg:py-24">
            <div className="space-y-5">
              <p className="altitude-eyebrow">Issue 07 · Summer Sky</p>
              <h1 className="font-display text-[2.9rem] leading-[0.92] tracking-[-0.06em] text-[#f6efe3] sm:text-[4rem] lg:text-[4.9rem]">
                Cinema at <span className="italic text-[#ff9d42]">thirty-</span>
                <br />
                <span className="italic text-[#ff9d42]">eight</span> thousand feet.
              </h1>
              <p className="max-w-2xl text-[0.95rem] leading-7 text-[#c1bbb2] sm:text-[1rem]">
                A hand-curated catalog of films for the long haul — rated by the passengers in the
                seats around you.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {featuredMovie ? (
                <Button asChild size="lg">
                  <Link to={`/movies/${featuredMovie.id}`}>
                    Watch this month&apos;s feature
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : null}
              <Button asChild size="lg" variant="outline">
                <a href="#catalog">Browse the catalog</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="altitude-shell relative z-10 -mt-24 space-y-14">
        {featuredMovie ? (
          <section
            className="altitude-panel relative overflow-hidden px-6 py-6 sm:px-10 sm:py-10"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(8,16,25,0.95) 0%, rgba(8,16,25,0.94) 38%, rgba(8,16,25,0.88) 100%), url(${featuredMovie.coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="grid gap-8 lg:grid-cols-[280px_1fr_auto] lg:items-center">
              <div className="overflow-hidden rounded-[26px]">
                <img
                  alt={featuredMovie.title}
                  className="aspect-[0.72] w-full object-cover"
                  src={featuredMovie.coverUrl}
                />
              </div>

              <div className="space-y-4">
                <p className="altitude-eyebrow">Feature of the month</p>
                <div>
                  <h2 className="font-display text-[2.7rem] tracking-[-0.05em] text-[#f6efe3]">
                    {featuredMovie.title}
                  </h2>
                  <p className="mt-2 text-sm uppercase tracking-[0.28em] text-[#8f8a83]">
                    {getMovieMeta(featuredMovie).year} · {getMovieMeta(featuredMovie).duration} ·{" "}
                    {getMovieMeta(featuredMovie).genre}
                  </p>
                </div>
                <p className="max-w-3xl text-[1rem] leading-7 text-[#c1bbb2]">{featuredMovie.synopsis}</p>
                <p className="text-[1rem] font-semibold text-[#f5a141]">
                  {featuredMovie.avgRating === null ? "No ratings yet" : `${featuredMovie.avgRating.toFixed(1)} / 5`}
                </p>
              </div>

              <div className="lg:justify-self-end">
                <Button asChild size="lg">
                  <Link to={`/movies/${featuredMovie.id}`}>Open film</Link>
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-7" id="catalog">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <p className="altitude-kicker">The catalog</p>
            <div className="space-y-2">
              <h2 className="font-display text-[2.8rem] tracking-[-0.05em] text-[#f6efe3]">
                On board this week
              </h2>
              <p className="text-base text-[#8f8a83]">
                Search by title or filter by genre.
              </p>
            </div>
          </div>

          <div className="w-full xl:max-w-[480px]">
            <Input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search a title, a mood, a genre..."
              value={search}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {genreOptions.map((genre) => (
            <Button
              key={genre}
              className={activeGenre === genre ? "" : "text-[#b0aba4]"}
              onClick={() => setActiveGenre(genre)}
              size="sm"
              variant={activeGenre === genre ? "default" : "outline"}
            >
              {genre}
            </Button>
          ))}
        </div>

        {error ? (
          <FeedbackState
            description={error}
            title="Could not load the catalog"
            action={
              <Button onClick={() => loadMovies().catch(() => undefined)} variant="outline">
                Retry
              </Button>
            }
          />
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border-white/6 bg-[#0d1722] py-0">
                <Skeleton className="aspect-[0.78] w-full" />
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <FeedbackState
            title="No matches"
            description="Try another search or switch the filter."
          />
        ) : (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        <div className="altitude-divider pt-10">
          <div className="flex items-end justify-between gap-4">
            <BrandMark />
            <p className="hidden text-[0.7rem] uppercase tracking-[0.42em] text-[#8f8a83] md:block">
              {isLoading ? "Loading..." : `${filteredMovies.length} films loaded`}
            </p>
          </div>
        </div>
        </section>
      </div>
    </div>
  );
}
