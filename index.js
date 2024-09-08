import { app } from "./src/app.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

app.listen(8000, () => {
  console.log("Server started on port 8000");
});
