import { apiRequest } from "@/api/client";
import type { UpdateProfileInput, AuthUser } from "@/types/auth";
import type { UserActivity } from "@/types/user";

export const getMyActivity = (token: string) =>
  apiRequest<UserActivity>("/users/me/activity", {
    token
  });

export const updateMyProfile = (token: string, input: UpdateProfileInput) =>
  apiRequest<AuthUser>("/users/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(input)
  });

