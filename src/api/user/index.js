import Express from "express";
import AuthorsModel from "../authors/model.js";
import BlogpostsModel from "../blogposts/model.js";
import createHttpError from "http-errors";
import { createTokens } from "../../lib/auth/tools.js";
import { JWTokenAuth } from "../../lib/auth/tokenAuth.js";

const UserRouter = Express.Router();

UserRouter.post("/me/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const author = await AuthorsModel.checkCreditentials(email, password);
    if (author) {
      const { accessToken, refreshToken } = await createTokens(author);
      res.send({
        message: "You've successfully logged in!",
        accessToken,
        refreshToken,
      });
    } else {
      next(createHttpError(401, "Creditentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

UserRouter.get("/me", JWTokenAuth, async (req, res, next) => {
  try {
    const author = await AuthorsModel.findById(req.author._id);
    if (author) res.send(author);
    else
      next(createHttpError(404, `Author with id ${req.author._id} not found!`));
  } catch (error) {
    next(error);
  }
});

UserRouter.put("/me", JWTokenAuth, async (req, res, next) => {
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

UserRouter.delete("/me", JWTokenAuth, async (req, res, next) => {
  try {
    await AuthorsModel.findByIdAndDelete(req.author._id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

UserRouter.get("/me/blogposts", JWTokenAuth, async (req, res, next) => {
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
  JWTokenAuth,
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
  JWTokenAuth,
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
  JWTokenAuth,
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
