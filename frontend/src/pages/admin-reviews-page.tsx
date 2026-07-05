import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "@/api/client";
import { deleteAdminComment, getAdminComments, moderateComment } from "@/api/comments";
import { getMovies } from "@/api/movies";
import { FeedbackState } from "@/components/feedback/feedback-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/movie-presentation";
import type { MovieComment, MovieSummary } from "@/types/movie";

const seatLabels = ["3C", "14A", "22F", "8B", "31D", "9A", "17C", "5F"];

function getSeatLabel(userId: number) {
  return seatLabels[(userId - 1) % seatLabels.length];
}

function formatCabinDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  })
    .format(new Date(value))
    .replace(",", "")
    .toUpperCase();
}

function renderStars(value: number | null | undefined) {
  if (!value) {
    return null;
  }

  return "★".repeat(value).padEnd(5, "☆");
}

export function AdminReviewsPage() {
  const { token } = useAuth();
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCommentId, setPendingCommentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const [moviesResponse, commentsResponse] = await Promise.all([
        getMovies(),
        getAdminComments(token)
      ]);
      setMovies(moviesResponse);
      setComments(commentsResponse);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Could not load moderation."
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData().catch(() => undefined);
  }, [loadData]);

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

    try {
      const updatedComment = await moderateComment(token, commentId, input);
      setComments((current) =>
        current.map((comment) => (comment.id === commentId ? updatedComment : comment))
      );
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Could not update the note."
      );
    } finally {
      setPendingCommentId(null);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!token) {
      return;
    }

    setPendingCommentId(commentId);

    try {
      await deleteAdminComment(token, commentId);
      setComments((current) => current.filter((comment) => comment.id !== commentId));
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Could not delete the note."
      );
    } finally {
      setPendingCommentId(null);
    }
  };

  const filteredComments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch.length === 0) {
      return comments;
    }

    return comments.filter((comment) => {
      return (
        comment.content.toLowerCase().includes(normalizedSearch) ||
        comment.user.displayName.toLowerCase().includes(normalizedSearch) ||
        (comment.movie?.title ?? "").toLowerCase().includes(normalizedSearch)
      );
    });
  }, [comments, search]);

  const stats = [
    { label: "Films", value: movies.length },
    { label: "Reviews", value: comments.length },
    { label: "Flagged", value: comments.filter((comment) => comment.flagged).length }
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
        <div className="space-y-3">
          <p className="altitude-eyebrow">Admin Panel</p>
          <div>
            <h1 className="font-display text-[3.2rem] tracking-[-0.06em] text-[#f6efe3]">Admin Dashboard</h1>
            <p className="mt-2 text-[1rem] text-[#bcb6ac]">
              Review comments and moderate visibility.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="altitude-panel px-6 py-4 text-center">
              <p className="font-display text-[2.5rem] text-[#f5a141]">{stat.value}</p>
              <p className="mt-2 text-[0.76rem] uppercase tracking-[0.34em] text-[#8f8a83]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-6 border-b border-white/6">
        <Link className="border-b-2 border-transparent pb-4 text-[1.05rem] font-medium text-[#8f8a83]" to="/admin/movies">
          Movies
        </Link>
        <Link className="border-b-2 border-[#ff9d42] pb-4 text-[1.05rem] font-medium text-[#f6efe3]" to="/admin/reviews">
          Reviews
        </Link>
      </div>

      <section className="space-y-6">
        <div className="max-w-xl">
          <Input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reviews..."
            value={search}
          />
        </div>

        {error && comments.length === 0 ? (
          <FeedbackState
            title="Could not load moderation"
            description={error}
            action={
              <Button onClick={() => loadData().catch(() => undefined)} variant="outline">
                Retry
              </Button>
            }
          />
        ) : isLoading ? (
          <p className="text-sm text-[#8f8a83]">Loading...</p>
        ) : filteredComments.length === 0 ? (
          <FeedbackState title="No reviews found" description="Try another search." />
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment) => {
              const isPending = pendingCommentId === comment.id;
              const rowTone = comment.hidden
                ? "border-[#5d2930] bg-[#101821]"
                : comment.flagged
                  ? "border-[#6b4a26] bg-[#15181d]"
                  : "border-white/6 bg-[#0d1722]/95";

              return (
                <div
                  key={comment.id}
                  className={`flex flex-col gap-5 rounded-[28px] border px-5 py-5 xl:flex-row xl:items-start xl:justify-between ${rowTone}`}
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#1a2734] text-[1.05rem] font-semibold text-[#f6efe3]">
                      {getInitials(comment.user.displayName)}
                    </div>
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <p className="text-[1.05rem] font-semibold text-[#f6efe3]">{comment.user.displayName}</p>
                        <p className="text-[0.82rem] uppercase tracking-[0.28em] text-[#8f8a83]">
                          Seat {getSeatLabel(comment.user.id)}
                        </p>
                        <p className="text-[0.82rem] uppercase tracking-[0.28em] text-[#8f8a83]">
                          {formatCabinDate(comment.createdAt)}
                        </p>
                        {comment.movie?.title ? (
                          <span className="rounded-full bg-[#1a2734] px-3 py-1 text-[0.72rem] uppercase tracking-[0.2em] text-[#b3c2d5]">
                            On {comment.movie.title}
                          </span>
                        ) : null}
                        {comment.flagged ? (
                          <span className="rounded-full bg-[#4a3118] px-3 py-1 text-[0.72rem] uppercase tracking-[0.2em] text-[#e5a351]">
                            Flagged
                          </span>
                        ) : null}
                        {comment.hidden ? (
                          <span className="rounded-full bg-[#4b1f29] px-3 py-1 text-[0.72rem] uppercase tracking-[0.2em] text-[#ff7e87]">
                            Hidden
                          </span>
                        ) : null}
                      </div>
                      {comment.userRating ? (
                        <p className="text-[0.95rem] font-semibold text-[#f5a141]">
                          {renderStars(comment.userRating)}
                        </p>
                      ) : null}
                      <p className="max-w-4xl text-[1rem] leading-8 text-[#d3ccc2]">{comment.content}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:min-w-[118px] xl:flex-col xl:items-end">
                    <Button
                      disabled={isPending}
                      onClick={() => handleModeration(comment.id, { hidden: !comment.hidden })}
                      size="sm"
                      variant="outline"
                    >
                      {comment.hidden ? "Unhide" : "Hide"}
                    </Button>
                    <Button
                      disabled={isPending}
                      onClick={() => handleModeration(comment.id, { flagged: !comment.flagged })}
                      size="sm"
                      variant="outline"
                    >
                      {comment.flagged ? "Unflag" : "Flag"}
                    </Button>
                    <Button
                      className="text-[#ff6c74]"
                      disabled={isPending}
                      onClick={() => handleDelete(comment.id)}
                      size="sm"
                      variant="outline"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
