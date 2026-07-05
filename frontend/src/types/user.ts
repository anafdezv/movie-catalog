import type { MovieComment, RatingRecord } from "@/types/movie";

export interface UserActivity {
  comments: Array<
    MovieComment & {
      movie: {
        id: number;
        title: string;
        coverUrl: string;
      };
    }
  >;
  ratings: Array<
    RatingRecord & {
      movie: {
        id: number;
        title: string;
        coverUrl: string;
      };
    }
  >;
}
