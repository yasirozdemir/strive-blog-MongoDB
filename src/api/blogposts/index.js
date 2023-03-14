import Express from "express";
import createHttpError from "http-errors";
import BlogpostsModel from "./model.js";

const blogpostsRouter = Express.Router();

// POST
blogpostsRouter.post("/", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

// GET
blogpostsRouter.get("/", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

// GET BY ID
blogpostsRouter.get("/:blogpostId", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

// PUT
blogpostsRouter.put("/:blogpostId", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

// DELETE
blogpostsRouter.delete("/:blogpostId", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

export default blogpostsRouter;
