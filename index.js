import { app } from "./src/app.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Server started on port 8000");
});
