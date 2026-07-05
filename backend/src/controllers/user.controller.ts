import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { serializeAuthUser } from "../utils/serialize-auth-user.js";

interface UpdateProfileInput {
  displayName?: string;
  avatarUrl?: string | null;
}

export const getMyActivity = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      comments: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              coverUrl: true
            }
          }
        }
      },
      ratings: {
        orderBy: {
          updatedAt: "desc"
        },
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              coverUrl: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  return user;
};

export const updateMyProfile = async (userId: number, input: UpdateProfileInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: input.displayName ?? user.displayName,
      avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : user.avatarUrl
    }
  });

  return serializeAuthUser(updatedUser);
};
