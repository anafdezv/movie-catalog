import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { env } from "../src/config/env.js";
import { roundAverageRating } from "../src/utils/average-rating.js";

const prisma = new PrismaClient();

const movies = [
  {
    title: "Blade Runner 2049",
    genre: "Sci-Fi",
    year: 2017,
    synopsis:
      "A blade runner uncovers a secret that could unravel the fragile balance between humans and replicants.",
    coverUrl: "https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg"
  },
  {
    title: "Arrival",
    genre: "Sci-Fi",
    year: 2016,
    synopsis:
      "A linguist races to decode the language of alien visitors before fear pushes the world into conflict.",
    coverUrl: "https://image.tmdb.org/t/p/w780/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg"
  },
  {
    title: "Dune",
    genre: "Sci-Fi",
    year: 2021,
    synopsis:
      "Paul Atreides inherits a vast destiny on the most dangerous planet in the universe as rival houses fight for control of the spice.",
    coverUrl: "https://image.tmdb.org/t/p/w780/d5NXSklXo0qyIYkgV94XAgMIckC.jpg"
  },
  {
    title: "The Grand Budapest Hotel",
    genre: "Comedy",
    year: 2014,
    synopsis:
      "A legendary concierge and his young protégé are swept into an absurd family feud over a priceless inheritance.",
    coverUrl: "https://image.tmdb.org/t/p/w780/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg"
  },
  {
    title: "Spirited Away",
    genre: "Fantasy",
    year: 2001,
    synopsis:
      "A young girl stumbles into a world of spirits and must find a way to rescue her parents and return home.",
    coverUrl: "https://image.tmdb.org/t/p/w780/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg"
  },
  {
    title: "Halloween",
    genre: "Slasher",
    year: 1978,
    synopsis:
      "On a quiet Halloween night, a masked killer returns to his hometown and turns the suburbs into a nightmare.",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/a/af/Halloween_%281978%29_theatrical_poster.jpg"
  },
  {
    title: "Friday the 13th",
    genre: "Slasher",
    year: 1980,
    synopsis:
      "A string of brutal murders interrupts the reopening of Camp Crystal Lake and revives its darkest legend.",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/Friday_the_13th_%281980%29_theatrical_poster.jpg/250px-Friday_the_13th_%281980%29_theatrical_poster.jpg"
  },
  {
    title: "A Nightmare on Elm Street",
    genre: "Slasher",
    year: 1984,
    synopsis:
      "A group of teenagers are hunted in their dreams by a scarred killer who turns sleep into a trap.",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/A_Nightmare_on_Elm_Street_%281984%29_theatrical_poster.jpg/250px-A_Nightmare_on_Elm_Street_%281984%29_theatrical_poster.jpg"
  },
  {
    title: "Scream",
    genre: "Slasher",
    year: 1996,
    synopsis:
      "A masked murderer stalks a small town while a group of friends realize they are living inside horror movie rules.",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Scream_%281996_film%29_poster.jpg/250px-Scream_%281996_film%29_poster.jpg"
  },
  {
    title: "The Simpsons Movie",
    genre: "Animation",
    year: 2007,
    synopsis:
      "Homer triggers a disaster that puts Springfield under a giant dome and forces the family to save their town.",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/d/d5/The_Simpsons_Movie_%282007%29.png"
  },
  {
    title: "Pulp Fiction",
    genre: "Crime",
    year: 1994,
    synopsis:
      "Hitmen, a boxer, a gangster's wife and a pair of robbers collide in a sharp, nonlinear crime story.",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Pulp_Fiction_%281994%29_poster.jpg/250px-Pulp_Fiction_%281994%29_poster.jpg"
  },
  {
    title: "Kill Bill: Volume 1",
    genre: "Action",
    year: 2003,
    synopsis:
      "After surviving an assassination attempt, a former killer begins a precise and bloody revenge mission.",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/Kill_Bill_Volume_1.png/250px-Kill_Bill_Volume_1.png"
  }
];

async function main() {
  const adminPasswordHash = await bcrypt.hash(env.adminPassword, 10);
  const demoPasswordHash = await bcrypt.hash(env.demoPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: env.adminEmail },
    update: {
      displayName: "Admin",
      avatarUrl: null,
      password: adminPasswordHash,
      role: "ADMIN"
    },
    create: {
      email: env.adminEmail,
      displayName: "Admin",
      avatarUrl: null,
      password: adminPasswordHash,
      role: "ADMIN"
    }
  });

  const demoUser = await prisma.user.upsert({
    where: { email: env.demoEmail },
    update: {
      displayName: "Demo User",
      avatarUrl: null,
      password: demoPasswordHash,
      role: "USER"
    },
    create: {
      email: env.demoEmail,
      displayName: "Demo User",
      avatarUrl: null,
      password: demoPasswordHash,
      role: "USER"
    }
  });

  await prisma.movie.deleteMany();
  await prisma.movie.createMany({ data: movies });

  const catalog = await prisma.movie.findMany({
    select: {
      id: true,
      title: true
    }
  });

  const movieIdByTitle = Object.fromEntries(catalog.map((movie) => [movie.title, movie.id]));

  await prisma.rating.createMany({
    data: [
      { userId: adminUser.id, movieId: movieIdByTitle["Blade Runner 2049"], value: 5 },
      { userId: adminUser.id, movieId: movieIdByTitle.Arrival, value: 4 },
      { userId: demoUser.id, movieId: movieIdByTitle["The Grand Budapest Hotel"], value: 5 },
      { userId: demoUser.id, movieId: movieIdByTitle["Spirited Away"], value: 4 }
    ]
  });

  const averageRatings = await prisma.rating.groupBy({
    by: ["movieId"],
    _avg: {
      value: true
    }
  });

  await prisma.$transaction(
    averageRatings.map(({ movieId, _avg }) =>
      prisma.movie.update({
        where: { id: movieId },
        data: {
          avgRating: roundAverageRating(_avg.value)
        }
      })
    )
  );

  await prisma.comment.createMany({
    data: [
      {
        userId: adminUser.id,
        movieId: movieIdByTitle["Blade Runner 2049"],
        content: "Perfect for a red-eye. Dense, beautiful and worth the full runtime."
      },
      {
        userId: adminUser.id,
        movieId: movieIdByTitle.Arrival,
        content: "Quiet, smart and exactly the kind of film that improves at cruising altitude."
      },
      {
        userId: demoUser.id,
        movieId: movieIdByTitle["The Grand Budapest Hotel"],
        content: "Beautiful production design. Every frame looks first class."
      },
      {
        userId: demoUser.id,
        movieId: movieIdByTitle["Spirited Away"],
        content: "Still one of the best comfort watches on a long flight."
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
