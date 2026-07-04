import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "@/api/client";
import { getAdminComments, moderateComment } from "@/api/comments";
import { getMovies } from "@/api/movies";
import { FeedbackState } from "@/components/feedback/feedback-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import type { MovieComment, MovieSummary } from "@/types/movie";

export function AdminReviewsPage() {
  const { token } = useAuth();
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCommentId, setPendingCommentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData().catch(() => undefined);
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

    try {
      await moderateComment(token, commentId, input);
      await loadData();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Could not update the note."
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
        <div className="space-y-4">
          <p className="altitude-eyebrow">Crew panel</p>
          <div>
            <h1 className="font-display text-6xl tracking-[-0.06em] text-[#f6efe3]">Cabin operations</h1>
            <p className="mt-3 text-xl text-[#bcb6ac]">
              Review passenger notes and moderate visibility.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="altitude-panel px-8 py-5 text-center">
              <p className="font-display text-5xl text-[#f5a141]">{stat.value}</p>
              <p className="mt-2 text-[0.76rem] uppercase tracking-[0.34em] text-[#8f8a83]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-8 border-b border-white/6">
        <Link className="border-b-2 border-transparent pb-4 text-2xl font-medium text-[#8f8a83]" to="/admin/movies">
          Movies
        </Link>
        <Link className="border-b-2 border-[#ff9d42] pb-4 text-2xl font-medium text-[#f6efe3]" to="/admin/reviews">
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

              return (
                <div
                  key={comment.id}
                  className="altitude-panel flex flex-col gap-4 px-5 py-5 xl:flex-row xl:items-start xl:justify-between"
                >
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="font-display text-4xl leading-none text-[#f6efe3]">
                        {comment.movie?.title ?? "Film"}
                      </p>
                      <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#8f8a83]">
                        {comment.user.displayName} · {new Date(comment.createdAt).toLocaleDateString("en-US")}
                      </p>
                    </div>
                    <p className="max-w-4xl text-lg leading-8 text-[#d3ccc2]">{comment.content}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#1a2734] px-3 py-1 text-xs uppercase tracking-[0.24em] text-[#b3c2d5]">
                        {comment.hidden ? "Hidden" : "Visible"}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em] ${
                          comment.flagged ? "bg-[#3d2a18] text-[#e5a351]" : "bg-[#131d28] text-[#8f8a83]"
                        }`}
                      >
                        {comment.flagged ? "Flagged" : "Clean"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <Button
                      disabled={isPending}
                      onClick={() => handleModeration(comment.id, { hidden: !comment.hidden })}
                      size="sm"
                      variant="outline"
                    >
                      {comment.hidden ? "Show" : "Hide"}
                    </Button>
                    <Button
                      disabled={isPending}
                      onClick={() => handleModeration(comment.id, { flagged: !comment.flagged })}
                      size="sm"
                      variant="outline"
                    >
                      {comment.flagged ? "Clear flag" : "Flag"}
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
