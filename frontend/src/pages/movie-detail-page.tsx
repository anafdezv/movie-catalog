import { ArrowLeft, MessageSquare, Play, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "@/api/client";
import { createComment } from "@/api/comments";
import { getMovie, getMovies } from "@/api/movies";
import { saveRating } from "@/api/ratings";
import { FeedbackState } from "@/components/feedback/feedback-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/movies/star-rating";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { getInitials, getMovieMeta } from "@/lib/movie-presentation";
import type { MovieDetail, MovieSummary } from "@/types/movie";

export function MovieDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, token, user } = useAuth();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [catalog, setCatalog] = useState<MovieSummary[]>([]);
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
  };

  useEffect(() => {
    setIsLoading(true);
    loadMovie().catch(() => undefined);
  }, [id]);

  useEffect(() => {
    getMovies()
      .then(setCatalog)
      .catch(() => undefined);
  }, []);

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
          : "Could not post the note."
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
        requestError instanceof ApiError ? requestError.message : "Could not save the rating."
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
  const ratingBreakdown = [
    { stars: 5, value: Math.min(68, 48 + Math.round((movie.avgRating ?? 0) * 4)) },
    { stars: 4, value: 22 },
    { stars: 3, value: 7 },
    { stars: 2, value: 2 },
    { stars: 1, value: 1 }
  ];

  return (
    <div className="space-y-14">
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
          <div className="overflow-hidden rounded-[26px] shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
            <img alt={movie.title} className="aspect-[0.72] h-full w-full object-cover" src={movie.coverUrl} />
          </div>

          <div className="space-y-6">
            <Link
              className="inline-flex items-center gap-2 text-[0.78rem] font-medium uppercase tracking-[0.32em] text-[#d89842]"
              to="/"
            >
              <ArrowLeft className="size-4" />
              Back to catalog
            </Link>

            <div className="space-y-4">
              <h1 className="font-display text-6xl tracking-[-0.06em] text-[#f6efe3]">{movie.title}</h1>
              <p className="text-[0.82rem] uppercase tracking-[0.36em] text-[#9c968e]">
                {movieMeta.year} · {movieMeta.duration} ·{" "}
                <span className="text-[#e0a048]">{movieMeta.genre}</span>
              </p>
              <p className="max-w-3xl text-2xl leading-[1.45] text-[#d3ccc2]">{movie.synopsis}</p>
            </div>

            <div className="altitude-panel grid gap-4 px-5 py-5 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center">
              <div className="space-y-2">
                <p className="altitude-kicker">Average</p>
                <p className="font-display text-5xl text-[#f5a141]">
                  {movie.avgRating === null ? "—" : movie.avgRating.toFixed(1)}
                  <span className="ml-2 text-xl text-[#9c968e]">/ 5.0</span>
                </p>
                <div className="flex items-center gap-1 text-[#f5a141]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-4 fill-current" />
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-white/6 lg:border-l lg:pl-6">
                <p className="altitude-kicker">Cabin notes</p>
                <p className="font-display text-4xl text-[#f6efe3]">{totalNotes}</p>
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
              <h2 className="font-display text-5xl tracking-[-0.05em] text-[#f6efe3]">
                Cabin conversation
              </h2>
              <p className="altitude-kicker">{totalNotes} notes</p>
            </div>
            <MessageSquare className="size-5 text-[#8f8a83]" />
          </div>

          {isAuthenticated ? (
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
                      {movieMeta.seatTag} · Leaving a note
                    </p>
                  </div>
                </div>
                <StarRating onChange={setSelectedRating} value={selectedRating} />
              </div>

              <Textarea
                onChange={(event) => setCommentContent(event.target.value)}
                placeholder="Say something worth the cruise altitude..."
                value={commentContent}
              />

              {submissionError ? <p className="text-sm text-destructive">{submissionError}</p> : null}

              <div className="flex justify-end">
                <Button
                  disabled={isSubmittingComment || commentContent.trim().length === 0}
                  onClick={handleCommentSubmit}
                  size="lg"
                >
                  {isSubmittingComment ? "Posting..." : "Post note"}
                </Button>
              </div>
            </div>
          ) : (
            <FeedbackState
              title="Sign in to join the cabin"
              description="Save your rating and leave a note for other passengers."
              action={
                <Button asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
              }
            />
          )}

          {movie.comments.length === 0 ? (
            <FeedbackState title="No notes yet" description="There are no notes on this film yet." />
          ) : (
            <div className="space-y-4">
              {movie.comments.map((comment) => (
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
                        </div>
                      </div>
                    </div>

                    <p className="text-lg leading-8 text-[#d3ccc2]">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
                    className="h-24 w-18 rounded-[18px] object-cover"
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
    </div>
  );
}
