import { MessageSquare, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "@/api/client";
import { getMovie } from "@/api/movies";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import type { MovieDetail } from "@/types/movie";

export function MovieDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const movieId = Number(id);

    if (!Number.isFinite(movieId)) {
      setError("Pelicula no encontrada.");
      setIsLoading(false);
      return;
    }

    let isActive = true;

    getMovie(movieId)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setMovie(response);
        setError(null);
      })
      .catch((requestError) => {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError ? requestError.message : "No se pudo cargar la pelicula."
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
  }, [id]);

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Skeleton className="aspect-[2/3] w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <Card className="border-border/70 bg-card/95">
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">{error ?? "Pelicula no encontrada."}</p>
          <Button asChild variant="outline">
            <Link to="/">Volver al catalogo</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm">
          <img alt={movie.title} className="aspect-[2/3] h-full w-full object-cover" src={movie.coverUrl} />
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-900">
                <Star className="size-4 fill-current" />
                {movie.avgRating === null ? "Sin votos" : `${movie.avgRating.toFixed(1)}/5`}
              </span>
              <span>{movie.comments.length} comentarios</span>
            </div>
          </div>

          <p className="max-w-3xl text-base leading-7 text-muted-foreground">{movie.synopsis}</p>

          <div className="rounded-3xl border border-border/70 bg-card/90 p-5">
            <h2 className="text-lg font-semibold text-foreground">Valoraciones y comentarios</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isAuthenticated
                ? "Puedes usar tu cuenta para puntuar la película y escribir un comentario."
                : "Inicia sesión para puntuar la película y dejar un comentario."}
            </p>
            {!isAuthenticated ? (
              <Button asChild className="mt-4">
                <Link to="/login">Iniciar sesion</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 text-muted-foreground" />
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Comentarios</h2>
        </div>

        {movie.comments.length === 0 ? (
          <Card className="border-border/70 bg-card/95">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Todavía no hay comentarios en esta película.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {movie.comments.map((comment) => (
              <Card key={comment.id} className="border-border/70 bg-card/95">
                <CardContent className="flex gap-4 p-5">
                  <Avatar className="size-10">
                    <AvatarImage alt={comment.user.displayName} src={comment.user.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {comment.user.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{comment.user.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{comment.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
