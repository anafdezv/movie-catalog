import type { NextFunction, Request, Response } from "express";

import { verifyAuthToken } from "../utils/auth-token.js";

export const attachCurrentUser = (request: Request, _response: Response, next: NextFunction) => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();

  try {
    request.user = verifyAuthToken(token);
  } catch {
    request.user = undefined;
  }

  next();
};
