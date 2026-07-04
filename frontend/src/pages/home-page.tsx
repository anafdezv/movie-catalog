import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "@/api/client";
import { FeedbackState } from "@/components/feedback/feedback-state";
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

  const loadMovies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getMovies();
      setMovies(response);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "No se pudieron cargar las películas."
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Películas</h2>
            <p className="text-sm text-muted-foreground">
              Catálogo con portada, sinopsis y valoración media.
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Cargando..." : `${movies.length} películas`}
          </span>
        </div>

        {error ? (
          <FeedbackState
            description={error}
            title="No se pudo cargar el catálogo"
            action={
              <Button onClick={() => loadMovies().catch(() => undefined)} variant="outline">
                Reintentar
              </Button>
            }
          />
        ) : isLoading ? (
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
        ) : movies.length === 0 ? (
          <FeedbackState
            title="No hay películas"
            description="Cuando cargues películas en el panel de administración aparecerán aquí."
          />
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
