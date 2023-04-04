import Express from "express";
import { basicAuth } from "../../lib/auth/basicAuth.js";
import AuthorsModel from "../authors/model.js";
import BlogpostsModel from "../blogposts/model.js";
import createHttpError from "http-errors";

const UserRouter = Express.Router();

UserRouter.get("/me", basicAuth, async (req, res, next) => {
  try {
    res.send(req.author);
  } catch (error) {
    next(error);
  }
});

UserRouter.put("/me", basicAuth, async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
      req.author._id,
      req.body,
      { new: true, runValidators: true }
    );
    res.send(updatedAuthor);
  } catch (error) {
    next(error);
  }
});

UserRouter.delete("/me", basicAuth, async (req, res, next) => {
  try {
    await AuthorsModel.findByIdAndDelete(req.author._id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

UserRouter.get("/me/blogposts", basicAuth, async (req, res, next) => {
  try {
    const blogposts = await BlogpostsModel.find({ author: req.author._id });
    if (blogposts) res.send(blogposts);
    else next(createHttpError(404, "Blogposts not found!"));
  } catch (error) {
    next(error);
  }
});

UserRouter.get(
  "/me/blogposts/:blogpostId",
  basicAuth,
  async (req, res, next) => {
    try {
      const blogpost = await BlogpostsModel.findOne({
        author: req.author._id,
        _id: req.params.blogpostId,
      });
      if (blogpost) res.send(blogpost);
      else next(createHttpError(404, "Blogpost not found!"));
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.put(
  "/me/blogposts/:blogpostId",
  basicAuth,
  async (req, res, next) => {
    try {
      const updatedBlogPost = await BlogpostsModel.findOneAndUpdate(
        {
          author: req.author._id,
          _id: req.params.blogpostId,
        },
        req.body,
        { new: true, runValidators: true }
      );
      if (updatedBlogPost) res.send(updatedBlogPost);
      else next(createHttpError(404, "Blogpost not found!"));
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.delete(
  "/me/blogposts/:blogpostId",
  basicAuth,
  async (req, res, next) => {
    try {
      const deleted = await BlogpostsModel.findOneAndUpdate({
        author: req.author._id,
        _id: req.params.blogpostId,
      });
      if (deleted) res.status(204).send();
      else next(createHttpError(404, "Blogpost not found!"));
    } catch (error) {
      next(error);
    }
  }
);

export default UserRouter;
