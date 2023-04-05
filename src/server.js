import Express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import {
  badRequestHandler,
  unauthorizedHandler,
  notFoundHandler,
  genericErrorHandler,
  forbiddenHandler,
} from "./errorHandlers.js";
import blogpostsRouter from "./api/blogposts/index.js";
import authorsRouter from "./api/authors/index.js";
import UserRouter from "./api/user/index.js";

const server = Express();
const port = process.env.PORT || 3001;

server.use(Express.json());

const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

const corsOpt = {
  origin: (currentOrigin, corsNext) => {
    if (!currentOrigin || whiteList.indexOf(currentOrigin) !== -1) {
      corsNext(null, true);
    } else {
      corsNext(
        createHttpError(400, `Origin ${currentOrigin} is not in the whitelist!`)
      );
    }
  },
};

server.use(cors(corsOpt));

server.use("/authors", UserRouter);
server.use("/authors", authorsRouter);
server.use("/blogposts", blogpostsRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`✅ Server is running on port ${port}`);
  });
});
