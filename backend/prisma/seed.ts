import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { env } from "../src/config/env.js";

const prisma = new PrismaClient();

const movies = [
  {
    title: "Blade Runner 2049",
    synopsis:
      "Un blade runner descubre un secreto que amenaza con desestabilizar el equilibrio entre humanos y replicantes.",
    coverUrl: "https://placehold.co/600x900/141414/f5efe6?text=Blade+Runner+2049"
  },
  {
    title: "Arrival",
    synopsis:
      "Una lingüista intenta descifrar el lenguaje de visitantes extraterrestres antes de que el miedo desencadene un conflicto global.",
    coverUrl: "https://placehold.co/600x900/243447/f5efe6?text=Arrival"
  },
  {
    title: "Dune",
    synopsis:
      "Paul Atreides hereda un destino inmenso en el planeta más peligroso del universo mientras distintas casas compiten por el control de la especia.",
    coverUrl: "https://placehold.co/600x900/5c3b1e/f5efe6?text=Dune"
  },
  {
    title: "The Grand Budapest Hotel",
    synopsis:
      "Un conserje legendario y su joven protegido quedan atrapados en una absurda disputa familiar por una herencia de valor incalculable.",
    coverUrl: "https://placehold.co/600x900/a63d40/f5efe6?text=Grand+Budapest"
  },
  {
    title: "Spirited Away",
    synopsis:
      "Una niña cruza accidentalmente a un mundo de espíritus y debe encontrar la forma de rescatar a sus padres y regresar a casa.",
    coverUrl: "https://placehold.co/600x900/1f5c4a/f5efe6?text=Spirited+Away"
  },
  {
    title: "Moonlight",
    synopsis:
      "La vida de Chiron se narra en tres etapas mientras trata de definir su identidad entre la dureza del entorno y sus deseos más íntimos.",
    coverUrl: "https://placehold.co/600x900/1b3a57/f5efe6?text=Moonlight"
  }
];

async function main() {
  const adminPasswordHash = await bcrypt.hash(env.adminPassword, 10);
  const demoPasswordHash = await bcrypt.hash(env.demoPassword, 10);

  await prisma.user.upsert({
    where: { email: env.adminEmail },
    update: {
      displayName: "Admin",
      avatarUrl: "https://placehold.co/128x128/141414/f5efe6?text=A",
      password: adminPasswordHash,
      role: "ADMIN"
    },
    create: {
      email: env.adminEmail,
      displayName: "Admin",
      avatarUrl: "https://placehold.co/128x128/141414/f5efe6?text=A",
      password: adminPasswordHash,
      role: "ADMIN"
    }
  });

  await prisma.user.upsert({
    where: { email: env.demoEmail },
    update: {
      displayName: "Demo User",
      avatarUrl: "https://placehold.co/128x128/243447/f5efe6?text=D",
      password: demoPasswordHash,
      role: "USER"
    },
    create: {
      email: env.demoEmail,
      displayName: "Demo User",
      avatarUrl: "https://placehold.co/128x128/243447/f5efe6?text=D",
      password: demoPasswordHash,
      role: "USER"
    }
  });

  await prisma.movie.deleteMany();
  await prisma.movie.createMany({ data: movies });
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
