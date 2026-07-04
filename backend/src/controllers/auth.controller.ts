import { prisma } from "../lib/prisma.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signAuthToken } from "../utils/auth-token.js";
import { serializeAuthUser } from "../utils/serialize-auth-user.js";
import { HttpError } from "../utils/http-error.js";

interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  avatarUrl?: string | null;
}

interface LoginInput {
  email: string;
  password: string;
}

const buildAuthResponse = (token: string, user: ReturnType<typeof serializeAuthUser>) => ({
  token,
  user
});

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existingUser) {
    throw new HttpError(409, "Email is already in use.");
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: await hashPassword(input.password),
      displayName: input.displayName,
      avatarUrl: input.avatarUrl ?? null,
      role: "USER"
    }
  });

  const authUser = serializeAuthUser(user);
  const token = signAuthToken(authUser);

  return buildAuthResponse(token, authUser);
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (!user) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const isPasswordValid = await comparePassword(input.password, user.password);

  if (!isPasswordValid) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const authUser = serializeAuthUser(user);
  const token = signAuthToken(authUser);

  return buildAuthResponse(token, authUser);
};

