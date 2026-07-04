import type { Request, Response } from "express";

export const notFound = (_request: Request, response: Response) => {
  response.status(404).json({ message: "Route not found." });
};

