import { Router } from "express";

import { authRouter } from "./auth.routes.js";
import { commentRouter } from "./comment.routes.js";
import { movieRouter } from "./movie.routes.js";
import { ratingRouter } from "./rating.routes.js";
import { userRouter } from "./user.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/movies", movieRouter);
apiRouter.use("/comments", commentRouter);
apiRouter.use("/ratings", ratingRouter);
apiRouter.use("/users", userRouter);
