import { apiRequest } from "@/api/client";
import type { MovieComment } from "@/types/movie";

export const createComment = (token: string, input: { movieId: number; content: string }) =>
  apiRequest<MovieComment>("/comments", {
    method: "POST",
    token,
    body: JSON.stringify(input)
  });

export const updateComment = (token: string, commentId: number, content: string) =>
  apiRequest<MovieComment>(`/comments/${commentId}`, {
    method: "PUT",
    token,
    body: JSON.stringify({ content })
  });

export const deleteComment = (token: string, commentId: number) =>
  apiRequest<{ message: string }>(`/comments/${commentId}`, {
    method: "DELETE",
    token
  });

export const getAdminComments = (token: string) =>
  apiRequest<MovieComment[]>("/comments", {
    token
  });

export const moderateComment = (
  token: string,
  commentId: number,
  input: { hidden?: boolean; flagged?: boolean }
) =>
  apiRequest<MovieComment>(`/comments/${commentId}/moderate`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input)
  });

