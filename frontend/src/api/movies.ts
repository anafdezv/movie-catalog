import { apiRequest } from "@/api/client";
import type { MovieDetail, MovieSummary } from "@/types/movie";

export const getMovies = () => apiRequest<MovieSummary[]>("/movies");

export const getMovie = (movieId: number) => apiRequest<MovieDetail>(`/movies/${movieId}`);

export const createMovie = (
  token: string,
  input: { title: string; synopsis: string; coverUrl: string; genre: string; year: number }
) =>
  apiRequest<MovieSummary>("/movies", {
    method: "POST",
    token,
    body: JSON.stringify(input)
  });

export const updateMovie = (
  token: string,
  movieId: number,
  input: { title: string; synopsis: string; coverUrl: string; genre: string; year: number }
) =>
  apiRequest<MovieSummary>(`/movies/${movieId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(input)
  });

export const deleteMovie = (token: string, movieId: number) =>
  apiRequest<{ message: string }>(`/movies/${movieId}`, {
    method: "DELETE",
    token
  });
