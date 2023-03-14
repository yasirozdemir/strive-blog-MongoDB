import Express from "express";
import createHttpError from "http-errors";
import BlogpostsModel from "./model.js";

const blogpostsRouter = Express.Router();

// POST
blogpostsRouter.post("/", async (req, res, next) => {
  try {
    const newBlogpost = new BlogpostsModel(req.body);
    const { _id } = await newBlogpost.save();
    res.status(201).send({
      message: "New blogpost successfully published!",
      id: _id,
    });
  } catch (error) {
    next(error);
  }
});

// GET
blogpostsRouter.get("/", async (req, res, next) => {
  try {
    const blogposts = await BlogpostsModel.find();
    res.send(blogposts);
  } catch (error) {
    next(error);
  }
});

// GET BY ID
blogpostsRouter.get("/:blogpostId", async (req, res, next) => {
  try {
    const user = await BlogpostsModel.findById(req.params.blogpostId);
    if (user) {
      res.send(user);
    } else {
      next(
        createHttpError(
          404,
          `Blogpost with id ${req.params.blogpostId} not found!`
        )
      );
    }
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
