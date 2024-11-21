import express from "express";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Hi, welcome here.. ",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port : ${PORT}`);
});
