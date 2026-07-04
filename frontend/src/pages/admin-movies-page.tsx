import { useEffect, useState } from "react";

import { ApiError } from "@/api/client";
import { createMovie, deleteMovie, getMovies, updateMovie } from "@/api/movies";
import { FeedbackState } from "@/components/feedback/feedback-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import type { MovieSummary } from "@/types/movie";

export function AdminMoviesPage() {
  const { token } = useAuth();
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const loadMovies = async () => {
    try {
      const response = await getMovies();
      setMovies(response);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "No se pudieron cargar las películas."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMovies().catch(() => undefined);
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSynopsis("");
    setCoverUrl("");
  };

  const handleSubmit = async () => {
    if (!token || !title.trim() || !synopsis.trim() || !coverUrl.trim()) {
      setError("Completa título, sinopsis y portada.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        synopsis: synopsis.trim(),
        coverUrl: coverUrl.trim()
      };

      if (editingId) {
        await updateMovie(token, editingId, payload);
      } else {
        await createMovie(token, payload);
      }

      resetForm();
      await loadMovies();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "No se pudo guardar la película.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (movie: MovieSummary) => {
    setEditingId(movie.id);
    setTitle(movie.title);
    setSynopsis(movie.synopsis);
    setCoverUrl(movie.coverUrl);
    setError(null);
  };

  const handleDelete = async (movieId: number) => {
    if (!token) {
      return;
    }

    setDeletingId(movieId);
    setError(null);

    try {
      await deleteMovie(token, movieId);
      if (editingId === movieId) {
        resetForm();
      }
      await loadMovies();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "No se pudo borrar la película.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Películas</CardTitle>
          <CardDescription>Crear, editar y borrar películas del catálogo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="movie-title">Título</Label>
              <Input id="movie-title" onChange={(event) => setTitle(event.target.value)} value={title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="movie-cover">URL de la portada</Label>
              <Input id="movie-cover" onChange={(event) => setCoverUrl(event.target.value)} value={coverUrl} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="movie-synopsis">Sinopsis</Label>
            <Textarea id="movie-synopsis" onChange={(event) => setSynopsis(event.target.value)} value={synopsis} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button disabled={isSaving} onClick={handleSubmit}>
              {isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear película"}
            </Button>
            {editingId ? (
              <Button disabled={isSaving} onClick={resetForm} variant="outline">
                Cancelar
              </Button>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>Películas disponibles en el catálogo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : error && movies.length === 0 ? (
            <FeedbackState
              title="No se pudo cargar el listado"
              description={error}
              action={
                <Button onClick={() => loadMovies().catch(() => undefined)} variant="outline">
                  Reintentar
                </Button>
              }
            />
          ) : movies.length === 0 ? (
            <FeedbackState
              title="No hay películas"
              description="Crea la primera película desde este formulario."
            />
          ) : (
            movies.map((movie) => (
              <div
                key={movie.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/70 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-foreground">{movie.title}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{movie.synopsis}</p>
                  <p className="text-xs text-muted-foreground">
                    Valoración media: {movie.avgRating === null ? "Sin votos" : `${movie.avgRating.toFixed(1)}/5`}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button onClick={() => handleEdit(movie)} size="sm" variant="outline">
                    Editar
                  </Button>
                  <Button
                    disabled={deletingId === movie.id}
                    onClick={() => handleDelete(movie.id)}
                    size="sm"
                    variant="outline"
                  >
                    {deletingId === movie.id ? "Borrando..." : "Borrar"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
