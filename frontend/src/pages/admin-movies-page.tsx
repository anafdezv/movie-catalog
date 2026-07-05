import { Search, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "@/api/client";
import { createMovie, deleteMovie, getMovies, updateMovie } from "@/api/movies";
import { FeedbackState } from "@/components/feedback/feedback-state";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { MOVIE_GENRES } from "@/lib/movie-presentation";
import type { MovieSummary } from "@/types/movie";

type SortMode = "rating" | "title" | "year";

function renderRatingStars(value: number | null) {
  const roundedValue = Math.round(value ?? 0);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-[#f5a141]">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`size-3.5 ${index < roundedValue ? "fill-current text-[#f5a141]" : "text-[#5f6976]"}`}
          />
        ))}
      </div>
      <span className="text-base font-semibold text-[#c8c1b7]">
        {value === null ? "—" : value.toFixed(1)}
      </span>
    </div>
  );
}

export function AdminMoviesPage() {
  const { token } = useAuth();
  const [movies, setMovies] = useState<MovieSummary[]>([]);
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
  const [genre, setGenre] = useState<(typeof MOVIE_GENRES)[number]>(MOVIE_GENRES[0]);
  const [year, setYear] = useState("2026");

  const loadData = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const moviesResponse = await getMovies();
      setMovies(moviesResponse);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : "Could not load the panel."
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData().catch(() => undefined);
  }, [loadData]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSynopsis("");
    setCoverUrl("");
    setGenre(MOVIE_GENRES[0]);
    setYear("2026");
    setIsFormOpen(false);
  };

  const openCreateModal = () => {
    setError(null);
    setEditingId(null);
    setTitle("");
    setSynopsis("");
    setCoverUrl("");
    setGenre(MOVIE_GENRES[0]);
    setYear("2026");
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!token || !title.trim() || !synopsis.trim() || !coverUrl.trim() || !year.trim()) {
      setError("Complete all movie fields.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        synopsis: synopsis.trim(),
        coverUrl: coverUrl.trim(),
        genre,
        year: Number(year)
      };

      if (editingId) {
        await updateMovie(token, editingId, payload);
      } else {
        await createMovie(token, payload);
      }

      resetForm();
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Could not save the movie.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (movie: MovieSummary) => {
    setEditingId(movie.id);
    setTitle(movie.title);
    setSynopsis(movie.synopsis);
    setCoverUrl(movie.coverUrl);
    setGenre(movie.genre as (typeof MOVIE_GENRES)[number]);
    setYear(String(movie.year));
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
      setError(requestError instanceof ApiError ? requestError.message : "Could not delete the movie.");
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

      return (
        movie.title.toLowerCase().includes(normalizedSearch) ||
        movie.synopsis.toLowerCase().includes(normalizedSearch) ||
        movie.genre.toLowerCase().includes(normalizedSearch) ||
        String(movie.year).includes(normalizedSearch)
      );
    });

    return result.sort((left, right) => {
      if (sortMode === "title") {
        return left.title.localeCompare(right.title);
      }

      if (sortMode === "year") {
        return right.year - left.year;
      }

      return (right.avgRating ?? 0) - (left.avgRating ?? 0);
    });
  }, [movies, search, sortMode]);

  return (
    <div className="space-y-8">
      <div className="flex gap-8 border-b border-white/6">
        <Link className="border-b-2 border-[#ff9d42] pb-4 text-[1.05rem] font-medium text-[#f6efe3]" to="/admin/movies">
          Movies
        </Link>
        <Link className="border-b-2 border-transparent pb-4 text-[1.05rem] font-medium text-[#8f8a83]" to="/admin/reviews">
          Reviews
        </Link>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#8f8a83]" />
            <Input
              className="pl-13"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search films..."
              value={search}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-[0.76rem] uppercase tracking-[0.34em] text-[#8f8a83]">Sort</label>
              <Select onValueChange={(value) => setSortMode(value as SortMode)} value={sortMode}>
                <SelectTrigger className="min-w-[144px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={openCreateModal} size="lg">
              + New film
            </Button>
          </div>
        </div>

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
          <div className="overflow-hidden rounded-[30px] border border-white/6 bg-[#0d1722]/95">
            <div className="grid grid-cols-[minmax(0,3.5fr)_0.9fr_0.8fr_0.9fr_0.9fr_1fr] gap-4 border-b border-white/6 px-8 py-5 text-[0.76rem] uppercase tracking-[0.34em] text-[#8f8a83]">
              <span>Film</span>
              <span>Genre</span>
              <span>Year</span>
              <span>Rating</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {filteredMovies.map((movie, index) => {
              const isFeatured = index === 0 && sortMode === "rating";

              return (
                <div
                  key={movie.id}
                  className="grid grid-cols-[minmax(0,3.5fr)_0.9fr_0.8fr_0.9fr_0.9fr_1fr] gap-4 border-b border-white/6 px-8 py-5 last:border-b-0"
                >
                  <Link
                    className="group flex min-w-0 items-center gap-4 rounded-[18px] outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#f5a141]/50"
                    to={`/movies/${movie.id}`}
                  >
                    <img
                      alt={movie.title}
                      className="h-22 w-16 rounded-[14px] bg-[#0a121b] object-contain"
                      src={movie.coverUrl}
                    />
                    <div className="min-w-0 space-y-1.5">
                      <p className="font-display text-[2.15rem] leading-none text-[#f6efe3] transition-colors group-hover:text-[#f5a141]">
                        {movie.title}
                      </p>
                      <p className="line-clamp-1 text-[1rem] text-[#a59f95]">{movie.synopsis}</p>
                    </div>
                  </Link>

                  <span className="self-center text-[0.92rem] uppercase tracking-[0.34em] text-[#c8c1b7]">{movie.genre}</span>
                  <span className="self-center text-[1rem] text-[#c8c1b7]">{movie.year}</span>
                  <div className="self-center">{renderRatingStars(movie.avgRating)}</div>
                  <div className="self-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
                        isFeatured ? "bg-[#4c331a] text-[#f0aa58]" : "bg-[#1b2a3a] text-[#b4c4d6]"
                      }`}
                    >
                      {isFeatured ? "Featured" : "Live"}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-3">
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

      <Dialog
        onOpenChange={(open) => {
          setIsFormOpen(open);

          if (!open && !isSaving) {
            resetForm();
          }
        }}
        open={isFormOpen}
      >
        <DialogContent className="max-w-2xl rounded-[30px] border-white/10 bg-[#0d1722] p-6 text-[#f6efe3]">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="font-display text-[3rem] leading-none tracking-[-0.06em] text-[#f6efe3]">
              {editingId ? "Edit movie" : "Add a new movie"}
            </DialogTitle>
            <DialogDescription className="max-w-xl text-[1rem] leading-7 text-[#bcb6ac]">
              Set the core catalog metadata shown across the app.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="movie-title">Movie title</Label>
              <Input
                id="movie-title"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Movie title"
                value={title}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="movie-cover-url">Cover URL</Label>
              <Input
                id="movie-cover-url"
                onChange={(event) => setCoverUrl(event.target.value)}
                placeholder="https://..."
                value={coverUrl}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="movie-genre">Genre</Label>
                <Select
                  onValueChange={(value) => setGenre(value as (typeof MOVIE_GENRES)[number])}
                  value={genre}
                >
                  <SelectTrigger id="movie-genre">
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVIE_GENRES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="movie-year">Year</Label>
                <Input
                  id="movie-year"
                  inputMode="numeric"
                  maxLength={4}
                  onChange={(event) => setYear(event.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="2026"
                  type="text"
                  value={year}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="movie-synopsis">Synopsis</Label>
              <Textarea
                className="min-h-36 resize-none"
                id="movie-synopsis"
                onChange={(event) => setSynopsis(event.target.value)}
                placeholder="Write a short synopsis"
                value={synopsis}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button disabled={isSaving} onClick={handleSubmit} size="lg">
              {isSaving ? "Saving..." : editingId ? "Save changes" : "Create movie"}
            </Button>
            <Button disabled={isSaving} onClick={resetForm} size="lg" variant="outline">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
