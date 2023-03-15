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
    // Alternative 1
    const updatedUser = await BlogpostsModel.findByIdAndUpdate(
      req.params.blogpostId, // which one to update
      req.body, // how to update
      { new: true, runValidators: true }
      // OPTIONS
      // By default findByIdAndUpdate returns the record pre-modification. If you want to get the newly updated one you shall use new: true
      // By default validation is off in the findByIdAndUpdate --> runValidators: true
    );

    // Alternative 2
    // const updatedUser = await BlogpostsModel.findById(req.params.blogpostId);
    // updatedUser.author.name = "Pasha the cat";
    // await updatedUser.save();

    if (updatedUser) res.send(updatedUser);
    else
      next(
        createHttpError(
          404,
          `Blogpost with id ${req.params.blogpostId} not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

// DELETE
blogpostsRouter.delete("/:blogpostId", async (req, res, next) => {
  try {
    const deletedUser = await BlogpostsModel.findByIdAndDelete(
      req.params.blogpostId
    );
    if (deletedUser) res.status(204).send();
    else
      next(
        createHttpError(
          404,
          `Blogpost with id ${req.params.blogpostId} not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

// POST A COMMENT
blogpostsRouter.post("/:blogpostId", async (req, res, next) => {
  try {
    const comment = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const commentedBlogpost = await BlogpostsModel.findByIdAndUpdate(
      req.params.blogpostId,
      { $push: { comments: comment } },
      { new: true, runValidators: true }
    );
    if (commentedBlogpost) res.status(201).send(commentedBlogpost);
    else
      next(
        createHttpError(
          404,
          `Blogpost with id ${req.params.blogpostId} not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

// GET COMMENTS
blogpostsRouter.get("/:blogpostId/comments", async (req, res, next) => {
  try {
    const blogpost = await BlogpostsModel.findById(req.params.blogpostId);
    if (blogpost) res.send(blogpost.comments);
    else
      next(
        createHttpError(
          404,
          `Blogpost with id ${req.params.blogpostId} not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

// GET COMMENT BY ID
blogpostsRouter.get(
  "/:blogpostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogpost = await BlogpostsModel.findById(req.params.blogpostId);
      if (blogpost) {
        const comment = blogpost.comments.find(
          (c) => c._id.toString() === req.params.commentId
        );
        if (comment) res.send(comment);
        else {
          next(
            createHttpError(
              404,
              `Comment with id ${req.params.commentId} not found!`
            )
          );
        }
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
  }
);

// UPDATE A COMMENT
blogpostsRouter.put(
  "/:blogpostId/comments/:commentId",
  async (req, res, next) => {
    try {
    } catch (error) {
      next(error);
    }
  }
);

// DELETE A COMMENT
blogpostsRouter.delete(
  "/:blogpostId/comments/:commentId",
  async (req, res, next) => {
    const updatedBlogpost = await BlogpostsModel.findByIdAndUpdate(
      req.params.blogpostId,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true, runValidators: true }
    );
    if (updatedBlogpost) res.status(204).send();
    else
      next(
        createHttpError(
          404,
          `Blogpost with id ${req.params.blogpostId} not found!`
        )
      );
    try {
    } catch (error) {
      next(error);
    }
  }
);

export default blogpostsRouter;
