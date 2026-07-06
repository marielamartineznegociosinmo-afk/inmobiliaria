import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";
const FRONTEND_DIST = path.resolve(__dirname, "../../mariela-inmobiliaria/dist/public");

app.use("/api/uploads", express.static(path.resolve(UPLOAD_DIR)));
app.use(express.static(FRONTEND_DIST));

app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.includes(".")) {
    return next();
  }

  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

app.use("/api", router);

export default app;
