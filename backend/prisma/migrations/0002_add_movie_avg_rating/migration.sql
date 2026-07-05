ALTER TABLE "Movie"
ADD COLUMN "avgRating" DOUBLE PRECISION;

UPDATE "Movie"
SET "avgRating" = ratings.avg_rating
FROM (
    SELECT
        "movieId",
        ROUND(AVG("value")::numeric, 1)::double precision AS avg_rating
    FROM "Rating"
    GROUP BY "movieId"
) AS ratings
WHERE ratings."movieId" = "Movie"."id";
