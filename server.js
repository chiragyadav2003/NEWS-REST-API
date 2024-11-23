import express, { urlencoded } from "express";
import "dotenv/config";
import fileUpload from "express-fileupload";

const app = express();
const PORT = process.env.PORT || 8000;

// * Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Hi, welcome here.. ",
  });
});

// * Import routes
import { apiRouter } from "./routes/api.js";
app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port : ${PORT}`);
});
