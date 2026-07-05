export interface MovieSummary {
  id: number;
  title: string;
  synopsis: string;
  coverUrl: string;
  avgRating: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MovieComment {
  id: number;
  content: string;
  hidden: boolean;
  flagged: boolean;
  userRating?: number | null;
  movieId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    displayName: string;
    avatarUrl: string | null;
  };
  movie?: {
    id: number;
    title: string;
  };
}

export interface MovieDetail extends MovieSummary {
  comments: MovieComment[];
}

export interface RatingRecord {
  id: number;
  value: number;
  movieId: number;
  userId?: number;
  createdAt?: string;
  updatedAt: string;
  movie?: {
    id: number;
    title: string;
  };
}
