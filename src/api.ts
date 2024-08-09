import express, { ErrorRequestHandler } from "express";
import { UserRepository } from "./modules/user/user.repository";
import { UserService } from "./modules/user/user.service";
import { makeUserRouter } from "./routes/user.route";
import { DataSource } from "typeorm";
import { ZodError } from "zod";
import { authMiddleware } from "./middleware/authenticate.middleware";
import { makeAuthRouter } from "./routes/auth.route";
import cors from "cors";
import { swaggerOptions } from "./swagger";
import swaggerjsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export const makeApp = (dataSource: DataSource) => {
  const app = express();
  const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  };
  app.use(express.json());
  app.use(cors(corsOptions));

  const swaggerDocs = swaggerjsdoc(swaggerOptions);
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  if (process.env.NODE_ENV !== "test") {
    app.use((req, res, next) => {
      console.log(req.method, req.url);
      next();
    });
  }

  const userRepository = new UserRepository(dataSource);
  const userService = new UserService(userRepository);

  app.use("/auth", makeAuthRouter(userService));
  app.use("/users", authMiddleware(userService), makeUserRouter(userService));

  app.use((req, res) => {
    res.status(404).send({ message: "Not Found!" });
  });

  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof ZodError) {
      res
        .status(400)
        .json({ ok: false, message: err.errors.map((err) => err.message) });
      return;
    }

    res.status(500).json({ ok: false, message: ["Internal server error!"] });
  };

  app.use(errorHandler);

  return app;
};
