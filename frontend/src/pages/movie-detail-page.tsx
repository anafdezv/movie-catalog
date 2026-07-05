import { ArrowLeft, MessageSquare, Play, Star } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "@/api/client";
import { createComment, deleteComment, updateComment } from "@/api/comments";
import { getMovie, getMovies } from "@/api/movies";
import { saveRating } from "@/api/ratings";
import { FeedbackState } from "@/components/feedback/feedback-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/movies/star-rating";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { getInitials, getMovieMeta } from "@/lib/movie-presentation";
import type { MovieDetail, MovieSummary } from "@/types/movie";

const PENDING_RATING_STORAGE_KEY = "movie-catalog-pending-rating";

interface PendingRating {
  movieId: number;
  value: number;
}

function readPendingRating() {
  const rawValue = localStorage.getItem(PENDING_RATING_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as PendingRating;
  } catch {
    localStorage.removeItem(PENDING_RATING_STORAGE_KEY);
    return null;
  }
}

function writePendingRating(value: PendingRating) {
  localStorage.setItem(PENDING_RATING_STORAGE_KEY, JSON.stringify(value));
}

function clearPendingRating() {
  localStorage.removeItem(PENDING_RATING_STORAGE_KEY);
}

export function MovieDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, login, token, user } = useAuth();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [catalog, setCatalog] = useState<MovieSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isCommentEditorOpen, setIsCommentEditorOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const lastAppliedPendingRating = useRef<string | null>(null);
  const [pendingCommentId, setPendingCommentId] = useState<number | null>(null);

  const movieId = Number(id);

  const loadMovie = useCallback(async () => {
    if (!Number.isFinite(movieId)) {
      setError("Movie not found.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await getMovie(movieId);
      setMovie(response);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Could not load the movie."
      );
    } finally {
      setIsLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    setIsLoading(true);
    loadMovie().catch(() => undefined);
  }, [loadMovie]);

  useEffect(() => {
    getMovies()
      .then(setCatalog)
      .catch(() => undefined);
  }, []);

  const ownComment = movie?.comments.find((comment) => comment.userId === user?.id) ?? null;

  useEffect(() => {
    if (ownComment) {
      setCommentContent(ownComment.content);

      if (ownComment.userRating) {
        setSelectedRating(ownComment.userRating);
      }

      return;
    }

    setCommentContent("");
    setIsCommentEditorOpen(false);
  }, [ownComment]);

  const handleCommentSubmit = async () => {
    if (!token || !movie || !commentContent.trim()) {
      return;
    }

    setSubmissionError(null);
    setIsSubmittingComment(true);

    try {
      if (ownComment) {
        const updatedComment = await updateComment(token, ownComment.id, commentContent.trim());
        setMovie((current) =>
          current
            ? {
                ...current,
                comments: current.comments.map((comment) =>
                  comment.id === ownComment.id
                    ? {
                        ...comment,
                        content: updatedComment.content,
                        hidden: updatedComment.hidden,
                        flagged: updatedComment.flagged,
                        updatedAt: updatedComment.updatedAt
                      }
                    : comment
                )
              }
            : current
        );
        setIsCommentEditorOpen(false);
      } else {
        const createdComment = await createComment(token, {
          movieId: movie.id,
          content: commentContent.trim()
        });
        setMovie((current) =>
          current
            ? {
                ...current,
                comments: [createdComment, ...current.comments]
              }
            : current
        );
        setIsCommentEditorOpen(false);
      }
    } catch (requestError) {
      setSubmissionError(
        requestError instanceof ApiError
          ? requestError.message
          : `Could not ${ownComment ? "update" : "post"} the comment.`
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) {
      return;
    }

    setSubmissionError(null);
    setPendingCommentId(commentId);

    try {
      await deleteComment(token, commentId);
      setMovie((current) =>
        current
          ? {
              ...current,
              comments: current.comments.filter((comment) => comment.id !== commentId)
            }
          : current
      );

      if (ownComment?.id === commentId) {
        setCommentContent("");
        setIsCommentEditorOpen(false);
      }
    } catch (requestError) {
      setSubmissionError(
        requestError instanceof ApiError ? requestError.message : "Could not delete the comment."
      );
    } finally {
      setPendingCommentId(null);
    }
  };

  const submitRating = useCallback(
    async (ratingValue: number, authToken: string) => {
      if (!movie || ratingValue < 1) {
        return false;
      }

      setSubmissionError(null);
      setIsSubmittingRating(true);

      try {
        await saveRating(authToken, {
          movieId: movie.id,
          value: ratingValue
        });
        setSelectedRating(ratingValue);
        await loadMovie();
        return true;
      } catch (requestError) {
        setSubmissionError(
          requestError instanceof ApiError ? requestError.message : "Could not save the rating."
        );
        return false;
      } finally {
        setIsSubmittingRating(false);
      }
    },
    [loadMovie, movie]
  );

  useEffect(() => {
    if (!isAuthenticated || !token || !movie) {
      return;
    }

    const pendingRating = readPendingRating();

    if (!pendingRating || pendingRating.movieId !== movie.id || pendingRating.value < 1) {
      return;
    }

    const pendingKey = `${pendingRating.movieId}:${pendingRating.value}`;

    if (lastAppliedPendingRating.current === pendingKey) {
      return;
    }

    lastAppliedPendingRating.current = pendingKey;
    clearPendingRating();
    setSelectedRating(pendingRating.value);

    submitRating(pendingRating.value, token).then((saved) => {
      if (saved) {
        setIsLoginPromptOpen(false);
        setLoginPassword("");
        setLoginError(null);
        return;
      }

      writePendingRating(pendingRating);
      lastAppliedPendingRating.current = null;
    });
  }, [isAuthenticated, movie, submitRating, token]);

  const handleRatingSubmit = async () => {
    if (!movie) {
      return;
    }

    if (!token) {
      setSubmissionError(null);
      lastAppliedPendingRating.current = null;

      if (selectedRating > 0) {
        writePendingRating({
          movieId: movie.id,
          value: selectedRating
        });
      }

      setLoginError(null);
      setIsLoginPromptOpen(true);
      return;
    }

    if (selectedRating < 1) {
      setSubmissionError("Select a rating before saving.");
      return;
    }

    await submitRating(selectedRating, token);
  };

  const handleLoginPromptSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = loginEmail.trim();

    if (!email || !loginPassword) {
      setLoginError("Enter your email and password.");
      return;
    }

    setSubmissionError(null);
    setLoginError(null);
    setIsLoginSubmitting(true);

    try {
      await login({
        email,
        password: loginPassword
      });

      const pendingRating = readPendingRating();

      if (!pendingRating || pendingRating.movieId !== movieId || pendingRating.value < 1) {
        setIsLoginPromptOpen(false);
      }
    } catch (requestError) {
      setLoginError(
        requestError instanceof ApiError ? requestError.message : "Could not sign in."
      );
    } finally {
      setIsLoginSubmitting(false);
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
      <FeedbackState
        title="Could not load the movie"
        description={error ?? "Movie not found."}
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => loadMovie().catch(() => undefined)} variant="outline">
              Retry
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Back to catalog</Link>
            </Button>
          </div>
        }
      />
    );
  }

  const movieMeta = getMovieMeta(movie);
  const relatedMovies = catalog.filter((catalogMovie) => catalogMovie.id !== movie.id).slice(0, 3);
  const totalNotes = movie.comments.length;
  const visibleComments = ownComment
    ? isCommentEditorOpen
      ? movie.comments.filter((comment) => comment.id !== ownComment.id)
      : movie.comments
    : movie.comments;
  const ratingBreakdown = [
    { stars: 5, value: Math.min(68, 48 + Math.round((movie.avgRating ?? 0) * 4)) },
    { stars: 4, value: 22 },
    { stars: 3, value: 7 },
    { stars: 2, value: 2 },
    { stars: 1, value: 1 }
  ];

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[34px] border border-white/6 bg-[#0b131c] px-6 py-8 sm:px-10 sm:py-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-110 blur-2xl"
          style={{
            backgroundImage: `url(${movie.coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at top right, rgba(205,159,61,0.18), transparent 28%), linear-gradient(90deg, rgba(7,16,25,0.97) 0%, rgba(7,16,25,0.9) 42%, rgba(7,16,25,0.82) 72%, rgba(7,16,25,0.72) 100%)"
          }}
        />
        <div className="relative grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="overflow-hidden rounded-[26px] bg-[#0a121b] shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
            <img alt={movie.title} className="aspect-[2/3] h-full w-full object-contain" src={movie.coverUrl} />
          </div>

          <div className="space-y-5">
            <Link
              className="inline-flex items-center gap-2 text-[0.78rem] font-medium uppercase tracking-[0.32em] text-[#d89842]"
              to="/"
            >
              <ArrowLeft className="size-4" />
              Back to catalog
            </Link>

            <div className="space-y-3">
              <h1 className="font-display text-[3.4rem] tracking-[-0.06em] text-[#f6efe3]">{movie.title}</h1>
              <p className="text-[0.82rem] uppercase tracking-[0.36em] text-[#9c968e]">
                {movieMeta.year} · {movieMeta.duration} ·{" "}
                <span className="text-[#e0a048]">{movieMeta.genre}</span>
              </p>
              <p className="max-w-3xl text-[1.15rem] leading-8 text-[#d3ccc2]">{movie.synopsis}</p>
            </div>

            <div className="altitude-panel grid gap-4 px-5 py-5 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center">
              <div className="space-y-2">
                <p className="altitude-kicker">Average</p>
                <p className="font-display text-[2.7rem] text-[#f5a141]">
                  {movie.avgRating === null ? "—" : movie.avgRating.toFixed(1)}
                  <span className="ml-2 text-[1rem] text-[#9c968e]">/ 5.0</span>
                </p>
                <div className="flex items-center gap-1 text-[#f5a141]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-4 fill-current" />
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-white/6 lg:border-l lg:pl-6">
                <p className="altitude-kicker">Comments</p>
                <p className="font-display text-[2rem] text-[#f6efe3]">{totalNotes}</p>
              </div>

              <div className="space-y-2 border-white/6 lg:border-l lg:pl-6">
                <p className="altitude-kicker">Your rating</p>
                <StarRating onChange={setSelectedRating} value={selectedRating} />
              </div>

              <div className="lg:justify-self-end">
                <Button onClick={handleRatingSubmit} size="lg">
                  <Play className="size-4" />
                  {isSubmittingRating ? "Saving..." : "Rate film"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-10 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <h2 className="font-display text-[2.7rem] tracking-[-0.05em] text-[#f6efe3]">
                Comments
              </h2>
              <p className="altitude-kicker">{totalNotes} notes</p>
            </div>
            <MessageSquare className="size-5 text-[#8f8a83]" />
          </div>

          {isAuthenticated && (!ownComment || isCommentEditorOpen) ? (
            <div className="altitude-panel space-y-4 px-5 py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11">
                    <AvatarImage alt={user?.displayName} src={user?.avatarUrl ?? undefined} />
                    <AvatarFallback>{user ? getInitials(user.displayName) : "YO"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-[#f6efe3]">You</p>
                    <p className="text-[0.78rem] uppercase tracking-[0.28em] text-[#8f8a83]">
                      {movieMeta.seatTag} · {ownComment ? "Edit your comment" : "Leave a comment"}
                    </p>
                  </div>
                </div>
                <StarRating onChange={setSelectedRating} value={selectedRating} />
              </div>

              <Textarea
                onChange={(event) => setCommentContent(event.target.value)}
                placeholder="Write your comment..."
                value={commentContent}
              />

              {ownComment ? (
                <p className="text-sm text-[#8f8a83]">
                  You can keep one comment per movie. Saving here updates your existing comment.
                </p>
              ) : null}

              {submissionError ? <p className="text-sm text-destructive">{submissionError}</p> : null}

              <div className="flex justify-end gap-3">
                {ownComment ? (
                  <Button
                    className="text-red-400"
                    disabled={pendingCommentId === ownComment.id}
                    onClick={() => handleDeleteComment(ownComment.id)}
                    size="lg"
                    variant="outline"
                  >
                    {pendingCommentId === ownComment.id ? "Deleting..." : "Delete comment"}
                  </Button>
                ) : null}
                <Button
                  disabled={isSubmittingComment || commentContent.trim().length === 0}
                  onClick={handleCommentSubmit}
                  size="lg"
                >
                  {isSubmittingComment ? "Saving..." : ownComment ? "Update comment" : "Post comment"}
                </Button>
              </div>
            </div>
          ) : !isAuthenticated ? (
            <FeedbackState
              title="Sign in to join the conversation"
              description="Save your rating and leave a comment."
              action={
                <Button asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
              }
            />
          ) : null}

          {movie.comments.length === 0 ? (
            <FeedbackState title="No comments yet" description="There are no comments for this movie yet." />
          ) : visibleComments.length > 0 ? (
            <div className="space-y-4">
              {visibleComments.map((comment) => (
                <Card
                  key={comment.id}
                  className="border-white/6 bg-[#0d1722]/90 py-0"
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-11">
                          <AvatarImage alt={comment.user.displayName} src={comment.user.avatarUrl ?? undefined} />
                          <AvatarFallback>{getInitials(comment.user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#f6efe3]">{comment.user.displayName}</span>
                            {comment.userId === user?.id ? (
                              <span className="rounded-full bg-[#2a3340] px-2 py-0.5 text-[0.7rem] uppercase tracking-[0.2em] text-[#e0a048]">
                                You
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[0.78rem] uppercase tracking-[0.28em] text-[#8f8a83]">
                            {movieMeta.seatTag} · {new Date(comment.createdAt).toLocaleDateString("en-US")}
                          </p>
                          {comment.userRating ? (
                            <div className="mt-2">
                              <StarRating readonly value={comment.userRating} />
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {comment.userId === user?.id ? (
                        <div className="flex gap-2">
                          <Button
                            disabled={pendingCommentId === comment.id}
                            onClick={() => {
                              setIsCommentEditorOpen(true);
                              setCommentContent(comment.content);

                              if (comment.userRating) {
                                setSelectedRating(comment.userRating);
                              }
                            }}
                            size="sm"
                            variant="outline"
                          >
                            Edit
                          </Button>
                          <Button
                            className="text-red-400"
                            disabled={pendingCommentId === comment.id}
                            onClick={() => handleDeleteComment(comment.id)}
                            size="sm"
                            variant="outline"
                          >
                            Delete
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    <p className="text-lg leading-8 text-[#d3ccc2]">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="altitude-panel px-5 py-5">
            <p className="altitude-kicker mb-5">Rating breakdown</p>
            <div className="space-y-4">
              {ratingBreakdown.map((item) => (
                <div key={item.stars} className="grid grid-cols-[28px_1fr_40px] items-center gap-3">
                  <span className="font-semibold text-[#f6efe3]">{item.stars}★</span>
                  <div className="h-2 overflow-hidden rounded-full bg-[#243140]">
                    <div className="h-full rounded-full bg-[#ff9d42]" style={{ width: `${item.value}%` }} />
                  </div>
                  <span className="text-sm text-[#8f8a83]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="altitude-kicker">If you liked this</p>
            <div className="space-y-4">
              {relatedMovies.map((relatedMovie) => (
                <Link
                  key={relatedMovie.id}
                  className="flex items-center gap-4 rounded-[24px] border border-white/6 bg-[#0d1722] p-3 transition-colors hover:bg-[#111d29]"
                  to={`/movies/${relatedMovie.id}`}
                >
                  <img
                    alt={relatedMovie.title}
                    className="h-24 w-16 rounded-[18px] bg-[#0a121b] object-contain"
                    src={relatedMovie.coverUrl}
                  />
                  <div className="min-w-0">
                    <p className="font-display text-3xl leading-none text-[#f6efe3]">{relatedMovie.title}</p>
                    <p className="mt-2 text-[0.76rem] uppercase tracking-[0.34em] text-[#8f8a83]">
                      {getMovieMeta(relatedMovie).genre} · {getMovieMeta(relatedMovie).year}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#f5a141]">
                      {relatedMovie.avgRating === null ? "No ratings" : `★ ${relatedMovie.avgRating.toFixed(1)}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <Dialog
        onOpenChange={(open) => {
          setIsLoginPromptOpen(open);

          if (!open) {
            setLoginError(null);
          }
        }}
        open={isLoginPromptOpen}
      >
        <DialogContent
          className="max-w-md rounded-[30px] border-white/10 bg-[#0d1722] p-6 text-[#f6efe3] shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        >
          <DialogHeader className="space-y-2 text-left">
            <p className="altitude-kicker">Sign in required</p>
            <DialogTitle className="font-display text-[2rem] tracking-[-0.05em] text-[#f6efe3]">
              Sign in to save your rating.
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#bcb6ac]">
              {selectedRating > 0
                ? `Your ${selectedRating}-star rating is queued and will be saved after sign-in.`
                : "Sign in first, then rate this movie."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleLoginPromptSubmit}>
              <div className="space-y-2">
                <Label htmlFor="rating-login-email">Email</Label>
                <Input
                  autoComplete="email"
                  id="rating-login-email"
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="demo@moviecatalog.dev"
                  type="email"
                  value={loginEmail}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating-login-password">Password</Label>
                <Input
                  autoComplete="current-password"
                  id="rating-login-password"
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Your password"
                  type="password"
                  value={loginPassword}
                />
              </div>

              {loginError ? <p className="text-sm text-destructive">{loginError}</p> : null}

              <DialogFooter className="gap-3 pt-2">
                <Button className="flex-1" disabled={isLoginSubmitting} size="lg" type="submit">
                  {isLoginSubmitting ? "Signing in..." : "Sign in and save rating"}
                </Button>
                <Button
                  onClick={() => {
                    setIsLoginPromptOpen(false);
                    setLoginError(null);
                  }}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </DialogFooter>

              <p className="text-sm text-[#8f8a83]">
                No account?{" "}
                <Link
                  className="font-medium text-[#f5a141] hover:underline"
                  state={{ from: `/movies/${movie.id}` }}
                  to="/register"
                >
                  Create one
                </Link>
              </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
