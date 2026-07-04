import { useEffect, useState } from "react";

import { ApiError } from "@/api/client";
import { deleteComment, updateComment } from "@/api/comments";
import { getMyActivity, updateMyProfile } from "@/api/users";
import { FeedbackState } from "@/components/feedback/feedback-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import type { UserActivity } from "@/types/user";

export function ProfilePage() {
  const { token, updateUser, user } = useAuth();
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileName, setProfileName] = useState(user?.displayName ?? "");
  const [profileAvatar, setProfileAvatar] = useState(user?.avatarUrl ?? "");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [pendingCommentId, setPendingCommentId] = useState<number | null>(null);

  const loadActivity = async () => {
    if (!token) {
      return;
    }

    try {
      setError(null);
      const response = await getMyActivity(token);
      setActivity(response);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "No se pudo cargar tu actividad."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivity().catch(() => undefined);
  }, [token]);

  const handleProfileSubmit = async () => {
    if (!token) {
      return;
    }

    setIsSavingProfile(true);

    try {
      const updatedUser = await updateMyProfile(token, {
        displayName: profileName,
        avatarUrl: profileAvatar.trim() ? profileAvatar.trim() : null
      });
      updateUser(updatedUser);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "No se pudo guardar el perfil."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) {
      return;
    }

    setPendingCommentId(commentId);

    try {
      await deleteComment(token, commentId);
      await loadActivity();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "No se pudo borrar el comentario."
      );
    } finally {
      setPendingCommentId(null);
    }
  };

  const handleSaveComment = async (commentId: number) => {
    if (!token) {
      return;
    }

    setPendingCommentId(commentId);

    try {
      await updateComment(token, commentId, editingContent);
      setEditingCommentId(null);
      setEditingContent("");
      await loadActivity();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "No se pudo actualizar el comentario."
      );
    } finally {
      setPendingCommentId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/85">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Edita tus datos y consulta tu actividad.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileName">Nombre</Label>
              <Input id="profileName" onChange={(event) => setProfileName(event.target.value)} value={profileName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileAvatar">Avatar URL</Label>
              <Input
                id="profileAvatar"
                onChange={(event) => setProfileAvatar(event.target.value)}
                value={profileAvatar}
              />
            </div>
            <Button disabled={isSavingProfile} onClick={handleProfileSubmit}>
              {isSavingProfile ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Nombre</p>
              <p className="mt-2 text-sm font-medium text-foreground">{user?.displayName}</p>
            </div>
            <div className="rounded-2xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Email</p>
              <p className="mt-2 text-sm font-medium text-foreground">{user?.email}</p>
            </div>
            <div className="rounded-2xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Cuenta</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {user?.role === "ADMIN" ? "Administrador" : "Usuario"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/85">
          <CardHeader>
            <CardTitle>Comentarios</CardTitle>
            <CardDescription>Tus comentarios recientes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : error && !activity ? (
              <FeedbackState
                title="No se pudo cargar tu actividad"
                description={error}
                action={
                  <Button onClick={() => loadActivity().catch(() => undefined)} variant="outline">
                    Reintentar
                  </Button>
                }
              />
            ) : activity?.comments.length ? (
              activity.comments.map((comment) => (
                <div key={comment.id} className="space-y-3 rounded-2xl border border-border/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{comment.movie.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        disabled={pendingCommentId === comment.id}
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditingContent(comment.content);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Editar
                      </Button>
                      <Button
                        disabled={pendingCommentId === comment.id}
                        onClick={() => handleDeleteComment(comment.id)}
                        size="sm"
                        variant="outline"
                      >
                        {pendingCommentId === comment.id ? "Procesando..." : "Borrar"}
                      </Button>
                    </div>
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="space-y-3">
                      <Textarea onChange={(event) => setEditingContent(event.target.value)} value={editingContent} />
                      <div className="flex gap-2">
                        <Button disabled={pendingCommentId === comment.id} onClick={() => handleSaveComment(comment.id)} size="sm">
                          {pendingCommentId === comment.id ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button
                          disabled={pendingCommentId === comment.id}
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingContent("");
                          }}
                          size="sm"
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  )}
                </div>
              ))
            ) : (
              <FeedbackState
                title="Sin comentarios"
                description="Todavía no has escrito comentarios."
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/85">
          <CardHeader>
            <CardTitle>Valoraciones</CardTitle>
            <CardDescription>Tus puntuaciones más recientes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : error && !activity ? (
              <FeedbackState
                title="No se pudo cargar tu actividad"
                description={error}
                action={
                  <Button onClick={() => loadActivity().catch(() => undefined)} variant="outline">
                    Reintentar
                  </Button>
                }
              />
            ) : activity?.ratings.length ? (
              activity.ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="flex items-center justify-between rounded-2xl border border-border/70 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{rating.movie.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(rating.updatedAt).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
                    {rating.value}/5
                  </span>
                </div>
              ))
            ) : (
              <FeedbackState
                title="Sin valoraciones"
                description="Todavía no has valorado películas."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
