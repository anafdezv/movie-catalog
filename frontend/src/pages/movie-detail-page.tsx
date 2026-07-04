import { MessageSquare, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "@/api/client";
import { createComment } from "@/api/comments";
import { getMovie } from "@/api/movies";
import { saveRating } from "@/api/ratings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/movies/star-rating";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import type { MovieDetail } from "@/types/movie";

export function MovieDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const movieId = Number(id);

  const loadMovie = async () => {
    if (!Number.isFinite(movieId)) {
      setError("Pelicula no encontrada.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await getMovie(movieId);
      setMovie(response);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "No se pudo cargar la pelicula."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadMovie().catch(() => undefined);
  }, [id]);

  const handleCommentSubmit = async () => {
    if (!token || !movie || !commentContent.trim()) {
      return;
    }

    setSubmissionError(null);
    setIsSubmittingComment(true);

    try {
      await createComment(token, {
        movieId: movie.id,
        content: commentContent.trim()
      });
      setCommentContent("");
      await loadMovie();
    } catch (requestError) {
      setSubmissionError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo publicar el comentario."
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!token || !movie || selectedRating < 1) {
      return;
    }

    setSubmissionError(null);
    setIsSubmittingRating(true);

    try {
      await saveRating(token, {
        movieId: movie.id,
        value: selectedRating
      });
      await loadMovie();
    } catch (requestError) {
      setSubmissionError(
        requestError instanceof ApiError ? requestError.message : "No se pudo guardar la valoración."
      );
    } finally {
      setIsSubmittingRating(false);
    }
  };

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
            <Link to="/">Volver al catálogo</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="overflow-hidden rounded-[20px] border border-border/70 bg-card shadow-sm">
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

          <div className="rounded-2xl border border-border/70 bg-card/90 p-5">
            <h2 className="text-lg font-semibold text-foreground">Valorar y comentar</h2>
            {isAuthenticated ? (
              <div className="mt-4 space-y-5">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tu valoración</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <StarRating onChange={setSelectedRating} value={selectedRating} />
                    <Button disabled={isSubmittingRating || selectedRating < 1} onClick={handleRatingSubmit}>
                      {isSubmittingRating ? "Guardando..." : "Guardar valoración"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Tu comentario</p>
                  <Textarea
                    onChange={(event) => setCommentContent(event.target.value)}
                    placeholder="Escribe tu comentario"
                    value={commentContent}
                  />
                  <Button
                    disabled={isSubmittingComment || commentContent.trim().length === 0}
                    onClick={handleCommentSubmit}
                  >
                    {isSubmittingComment ? "Publicando..." : "Publicar comentario"}
                  </Button>
                </div>

                {submissionError ? <p className="text-sm text-destructive">{submissionError}</p> : null}
              </div>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  Inicia sesión para puntuar la película y dejar un comentario.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
              </>
            )}
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
