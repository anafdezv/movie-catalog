import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "@/api/client";
import { getAdminComments } from "@/api/comments";
import { createMovie, deleteMovie, getMovies, updateMovie } from "@/api/movies";
import { FeedbackState } from "@/components/feedback/feedback-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { getMovieMeta } from "@/lib/movie-presentation";
import type { MovieComment, MovieSummary } from "@/types/movie";

type SortMode = "rating" | "title";

export function AdminMoviesPage() {
  const { token } = useAuth();
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("rating");
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

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
        requestError instanceof ApiError ? requestError.message : "Could not load the panel."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => undefined);
  }, [token]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSynopsis("");
    setCoverUrl("");
    setIsFormOpen(false);
  };

  const handleSubmit = async () => {
    if (!token || !title.trim() || !synopsis.trim() || !coverUrl.trim()) {
      setError("Complete all film fields.");
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
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Could not save the film.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (movie: MovieSummary) => {
    setEditingId(movie.id);
    setTitle(movie.title);
    setSynopsis(movie.synopsis);
    setCoverUrl(movie.coverUrl);
    setIsFormOpen(true);
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
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Could not delete the film.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMovies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = movies.filter((movie) => {
      if (normalizedSearch.length === 0) {
        return true;
      }

      const meta = getMovieMeta(movie);

      return (
        movie.title.toLowerCase().includes(normalizedSearch) ||
        movie.synopsis.toLowerCase().includes(normalizedSearch) ||
        meta.genre.toLowerCase().includes(normalizedSearch)
      );
    });

    return result.sort((left, right) => {
      if (sortMode === "title") {
        return left.title.localeCompare(right.title);
      }

      return (right.avgRating ?? 0) - (left.avgRating ?? 0);
    });
  }, [movies, search, sortMode]);

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
              Manage the catalog and moderate what passengers see.
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
        <Link className="border-b-2 border-[#ff9d42] pb-4 text-2xl font-medium text-[#f6efe3]" to="/admin/movies">
          Movies
        </Link>
        <Link className="border-b-2 border-transparent pb-4 text-2xl font-medium text-[#8f8a83]" to="/admin/reviews">
          Reviews
        </Link>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="flex-1">
            <Input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search films..."
              value={search}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-[0.76rem] uppercase tracking-[0.34em] text-[#8f8a83]">Sort</label>
            <select
              className="h-11 rounded-[18px] border border-white/8 bg-[#101a24] px-4 text-[#f6efe3] outline-none"
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              value={sortMode}
            >
              <option value="rating">Rating</option>
              <option value="title">Title</option>
            </select>
            <Button
              onClick={() => {
                setIsFormOpen((current) => !current);
                if (editingId === null) {
                  setTitle("");
                  setSynopsis("");
                  setCoverUrl("");
                }
              }}
            >
              + New film
            </Button>
          </div>
        </div>

        {isFormOpen ? (
          <div className="altitude-panel grid gap-4 px-5 py-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <Input onChange={(event) => setTitle(event.target.value)} placeholder="Film title" value={title} />
              <Input onChange={(event) => setCoverUrl(event.target.value)} placeholder="Cover URL" value={coverUrl} />
            </div>
            <Textarea onChange={(event) => setSynopsis(event.target.value)} placeholder="Synopsis" value={synopsis} />
            <div className="flex gap-2">
              <Button disabled={isSaving} onClick={handleSubmit}>
                {isSaving ? "Saving..." : editingId ? "Save changes" : "Create film"}
              </Button>
              <Button disabled={isSaving} onClick={resetForm} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {error && movies.length === 0 ? (
          <FeedbackState
            title="Could not load the panel"
            description={error}
            action={
              <Button onClick={() => loadData().catch(() => undefined)} variant="outline">
                Retry
              </Button>
            }
          />
        ) : null}

        {isLoading ? (
          <p className="text-sm text-[#8f8a83]">Loading...</p>
        ) : filteredMovies.length === 0 ? (
          <FeedbackState title="No films found" description="Try another search or add a new film." />
        ) : (
          <div className="altitude-panel overflow-hidden">
            <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-white/6 px-6 py-5 text-[0.76rem] uppercase tracking-[0.34em] text-[#8f8a83]">
              <span>Film</span>
              <span>Genre</span>
              <span>Year</span>
              <span>Rating</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {filteredMovies.map((movie, index) => {
              const meta = getMovieMeta(movie);
              const status =
                index === 0 && sortMode === "rating"
                  ? { label: "Featured", className: "bg-[#3d2a18] text-[#e5a351]" }
                  : { label: "Live", className: "bg-[#1a2734] text-[#b3c2d5]" };

              return (
                <div
                  key={movie.id}
                  className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-white/6 px-6 py-5 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <img alt={movie.title} className="h-16 w-12 rounded-[12px] object-cover" src={movie.coverUrl} />
                    <div className="min-w-0">
                      <p className="font-display text-4xl leading-none text-[#f6efe3]">{movie.title}</p>
                      <p className="mt-2 line-clamp-1 text-sm text-[#8f8a83]">{movie.synopsis}</p>
                    </div>
                  </div>
                  <span className="self-center text-[0.76rem] uppercase tracking-[0.34em] text-[#bcb6ac]">{meta.genre}</span>
                  <span className="self-center text-[0.76rem] uppercase tracking-[0.34em] text-[#bcb6ac]">{meta.year}</span>
                  <span className="self-center text-lg font-semibold text-[#f5a141]">
                    ★ {movie.avgRating?.toFixed(1) ?? "—"}
                  </span>
                  <div className="self-center">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button onClick={() => handleEdit(movie)} size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button
                      className="text-red-400"
                      disabled={deletingId === movie.id}
                      onClick={() => handleDelete(movie.id)}
                      size="sm"
                      variant="outline"
                    >
                      {deletingId === movie.id ? "Removing..." : "Remove"}
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
