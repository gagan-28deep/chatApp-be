import { app } from "./src/app.js";
import {server} from "./src/socket/socket.js"
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log("Server started on port 8000");
});
