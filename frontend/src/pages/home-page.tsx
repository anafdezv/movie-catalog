import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "@/api/client";
import { getMovies } from "@/api/movies";
import { MovieCard } from "@/components/movies/movie-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import type { MovieSummary } from "@/types/movie";

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    getMovies()
      .then((response) => {
        if (!isActive) {
          return;
        }

        setMovies(response);
        setError(null);
      })
      .catch((requestError) => {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError ? requestError.message : "No se pudieron cargar las peliculas."
        );
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-[24px] border border-border/70 bg-card px-6 py-8 shadow-sm sm:px-8">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Movie Catalog
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Consulta películas, revisa su puntuación media y accede con tu cuenta para comentar y
            valorar.
          </p>
          {!isAuthenticated ? (
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <Link to="/login">
                  Iniciar sesión
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/register">Crear cuenta</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Peliculas</h2>
            <p className="text-sm text-muted-foreground">
              Un catalogo simple, con portada, sinopsis y valoracion media.
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Cargando..." : `${movies.length} peliculas`}
          </span>
        </div>

        {error ? (
          <Card className="border-destructive/30 bg-card/90">
            <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden py-0">
                <Skeleton className="aspect-[2/3] w-full" />
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
