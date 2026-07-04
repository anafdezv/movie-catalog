import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../utils/http-error.js";

export const requireAuth = (request: Request, _response: Response, next: NextFunction) => {
  if (!request.user) {
    next(new HttpError(401, "Authentication required."));
    return;
  }

  next();
};

export const requireAdmin = (request: Request, _response: Response, next: NextFunction) => {
  if (!request.user) {
    next(new HttpError(401, "Authentication required."));
    return;
  }

  if (request.user.role !== "ADMIN") {
    next(new HttpError(403, "Admin access required."));
    return;
  }

  next();
};

