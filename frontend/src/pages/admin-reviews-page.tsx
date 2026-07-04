import { useEffect, useState } from "react";

import { ApiError } from "@/api/client";
import { getAdminComments, moderateComment } from "@/api/comments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import type { MovieComment } from "@/types/movie";

export function AdminReviewsPage() {
  const { token } = useAuth();
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCommentId, setPendingCommentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await getAdminComments(token);
      setComments(response);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "No se pudieron cargar los comentarios."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments().catch(() => undefined);
  }, [token]);

  const handleModeration = async (
    commentId: number,
    input: {
      hidden?: boolean;
      flagged?: boolean;
    }
  ) => {
    if (!token) {
      return;
    }

    setPendingCommentId(commentId);
    setError(null);

    try {
      await moderateComment(token, commentId, input);
      await loadComments();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "No se pudo actualizar el comentario."
      );
    } finally {
      setPendingCommentId(null);
    }
  };

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle>Comentarios</CardTitle>
        <CardDescription>Revisar visibilidad y marcado de comentarios.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay comentarios para revisar.</p>
        ) : (
          comments.map((comment) => {
            const isPending = pendingCommentId === comment.id;

            return (
              <div key={comment.id} className="space-y-3 rounded-2xl border border-border/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{comment.movie?.title ?? "Película"}</p>
                    <p className="text-sm text-muted-foreground">{comment.user.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString("es-ES")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                      {comment.hidden ? "Oculto" : "Visible"}
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                      {comment.flagged ? "Marcado" : "Sin marcar"}
                    </span>
                  </div>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">{comment.content}</p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={isPending}
                    onClick={() => handleModeration(comment.id, { hidden: !comment.hidden })}
                    size="sm"
                    variant="outline"
                  >
                    {comment.hidden ? "Mostrar" : "Ocultar"}
                  </Button>
                  <Button
                    disabled={isPending}
                    onClick={() => handleModeration(comment.id, { flagged: !comment.flagged })}
                    size="sm"
                    variant="outline"
                  >
                    {comment.flagged ? "Quitar marca" : "Marcar"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
