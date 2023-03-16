import Express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import {
  badRequestHandler,
  unauthorizedHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js";
import blogpostsRouter from "./api/blogposts/index.js";
import authorsRouter from "./api/authors/index.js";

const server = Express();
const port = process.env.PORT || 3001;

server.use(cors());
server.use(Express.json());

server.use("/authors", authorsRouter);
server.use("/blogposts", blogpostsRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`✅ Server is running on port ${port}`);
  });
});
