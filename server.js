import express from "express";
import "dotenv/config";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { limiter } from "./config/ratelimit.config.js";

const app = express();
const PORT = process.env.PORT || 8000;

// * Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(express.static("public")); //statically serve files from 'public' directory
app.use(fileUpload());
app.use(limiter);

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Hi, welcome here.. ",
  });
});

// * Import routes
import { apiRouter } from "./routes/api.js";
app.use("/api", apiRouter);

// * 404 route for unmatched paths
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// * general error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred.",
  });
});

// * jobs import
import "./jobs/index.js";

app.listen(PORT, () => {
  console.log(`Server is running on port : ${PORT}`);
});
