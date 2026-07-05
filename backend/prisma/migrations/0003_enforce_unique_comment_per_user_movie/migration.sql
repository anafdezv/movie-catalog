WITH ranked_comments AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId", "movieId"
      ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
    ) AS duplicate_rank
  FROM "Comment"
)
DELETE FROM "Comment"
WHERE id IN (
  SELECT id
  FROM ranked_comments
  WHERE duplicate_rank > 1
);

CREATE UNIQUE INDEX "Comment_userId_movieId_key" ON "Comment"("userId", "movieId");
