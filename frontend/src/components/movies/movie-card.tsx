import { Star } from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import type { MovieSummary } from "@/types/movie";

function ratingLabel(value: number | null) {
  if (value === null) {
    return "Sin votos";
  }

  return `${value.toFixed(1)}/5`;
}

export function MovieCard({ movie }: { movie: MovieSummary }) {
  return (
    <Link className="group block" to={`/movies/${movie.id}`}>
      <Card className="overflow-hidden border-border/70 bg-card/90 py-0 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="aspect-[2/3] overflow-hidden bg-muted">
          <img
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            src={movie.coverUrl}
          />
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground">
              {movie.title}
            </h2>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
              <Star className="size-3.5 fill-current" />
              {ratingLabel(movie.avgRating)}
            </span>
          </div>
          <p className="line-clamp-3 text-sm text-muted-foreground">{movie.synopsis}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

