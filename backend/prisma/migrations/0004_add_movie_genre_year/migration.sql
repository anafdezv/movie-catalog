ALTER TABLE "Movie"
ADD COLUMN "genre" TEXT NOT NULL DEFAULT 'Drama',
ADD COLUMN "year" INTEGER NOT NULL DEFAULT 2024;

UPDATE "Movie" SET "genre" = 'Sci-Fi', "year" = 2017 WHERE "title" = 'Blade Runner 2049';
UPDATE "Movie" SET "genre" = 'Sci-Fi', "year" = 2016 WHERE "title" = 'Arrival';
UPDATE "Movie" SET "genre" = 'Sci-Fi', "year" = 2021 WHERE "title" = 'Dune';
UPDATE "Movie" SET "genre" = 'Comedy', "year" = 2014 WHERE "title" = 'The Grand Budapest Hotel';
UPDATE "Movie" SET "genre" = 'Fantasy', "year" = 2001 WHERE "title" = 'Spirited Away';
UPDATE "Movie" SET "genre" = 'Slasher', "year" = 1978 WHERE "title" = 'Halloween';
UPDATE "Movie" SET "genre" = 'Slasher', "year" = 1980 WHERE "title" = 'Friday the 13th';
UPDATE "Movie" SET "genre" = 'Slasher', "year" = 1984 WHERE "title" = 'A Nightmare on Elm Street';
UPDATE "Movie" SET "genre" = 'Slasher', "year" = 1996 WHERE "title" = 'Scream';
UPDATE "Movie" SET "genre" = 'Animation', "year" = 2007 WHERE "title" = 'The Simpsons Movie';
UPDATE "Movie" SET "genre" = 'Crime', "year" = 1994 WHERE "title" = 'Pulp Fiction';
UPDATE "Movie" SET "genre" = 'Action', "year" = 2003 WHERE "title" = 'Kill Bill: Volume 1';

ALTER TABLE "Movie"
ALTER COLUMN "genre" DROP DEFAULT,
ALTER COLUMN "year" DROP DEFAULT;
