import { Star } from "lucide-react";
import { Link } from "react-router-dom";

import { getMovieMeta } from "@/lib/movie-presentation";
import type { MovieSummary } from "@/types/movie";

function ratingLabel(value: number | null) {
  if (value === null) {
    return "No ratings";
  }

  return `${value.toFixed(1)}/5`;
}

export function MovieCard({ movie }: { movie: MovieSummary }) {
  const meta = getMovieMeta(movie);

  return (
    <Link className="group block space-y-4" to={`/movies/${movie.id}`}>
      <div className="relative overflow-hidden rounded-[26px] border border-white/6 bg-[#101a24] transition-transform duration-300 hover:-translate-y-1">
        <div className="aspect-[0.78] overflow-hidden bg-[#0a121b]">
          <img
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            src={movie.coverUrl}
          />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#8f8a83]">
            {meta.genre} · {meta.year}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#f5a141]">
            <Star className="size-3.5 fill-current" />
            {ratingLabel(movie.avgRating)}
          </span>
        </div>
        <div className="min-h-[4.1rem]">
          <h2 className="font-display line-clamp-2 text-[1.55rem] leading-[0.95] tracking-[-0.04em] text-[#f6efe3] sm:text-[1.7rem]">
            {movie.title}
          </h2>
        </div>
      </div>
    </Link>
  );
}
