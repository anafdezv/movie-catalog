export interface CreateCommentInput {
  content: string;
  movieId: number;
}

export interface UpdateCommentInput {
  content: string;
}

export interface ModerateCommentInput {
  hidden?: boolean;
  flagged?: boolean;
}
