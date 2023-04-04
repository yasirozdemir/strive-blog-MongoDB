import Express from "express";
import createHttpError from "http-errors";
import BlogpostsModel from "./model.js";
import q2m from "query-to-mongo";
import { basicAuth } from "../../lib/auth/basicAuth.js";
import { adminOnly } from "../../lib/auth/admin.js";

const blogpostsRouter = Express.Router();

// POST
blogpostsRouter.post("/", basicAuth, async (req, res, next) => {
  try {
    const newBlogpost = new BlogpostsModel({
      ...req.body,
      author: req.author._id,
    });
    const { _id } = await newBlogpost.save();
    res.status(201).send({
      message: "New blogpost successfully published!",
      id: _id,
    });
  } catch (error) {
    next(error);
  }
});

// GET BLOGPOSTS INCLUDING AUTHORS DETAILS
blogpostsRouter.get("/", async (req, res, next) => {
  try {
    const queryToMongo = q2m(req.query);
    const { blogposts, totalNumOfBlogposts } =
      await BlogpostsModel.findBlogpostsWithAuthor(queryToMongo);
    res.send({
      links: queryToMongo.links(
        "http://localhost:3001/blogposts",
        totalNumOfBlogposts
      ),
      totalNumOfBlogposts,
      blogposts,
    });
  } catch (error) {
    next(error);
  }
});

// GET BY ID
blogpostsRouter.get("/:blogpostId", async (req, res, next) => {
  try {
    const blogpost = await BlogpostsModel.findBlogPostWithAuthor(
      req.params.blogpostId
    );
    if (blogpost) {
      res.send(blogpost);
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
blogpostsRouter.put(
  "/:blogpostId",
  basicAuth,
  adminOnly,
  async (req, res, next) => {
    try {
      // Alternative 1
      const updatedBlogpost = await BlogpostsModel.findByIdAndUpdate(
        req.params.blogpostId, // which one to update
        req.body, // how to update
        { new: true, runValidators: true }
        // OPTIONS
        // By default findByIdAndUpdate returns the record pre-modification. If you want to get the newly updated one you shall use new: true
        // By default validation is off in the findByIdAndUpdate --> runValidators: true
      );

      // Alternative 2
      // const updatedBlogpost = await BlogpostsModel.findById(req.params.blogpostId);
      // updatedBlogpost.author.name = "Pasha the cat";
      // await updatedBlogpost.save();

      if (updatedBlogpost) res.send(updatedBlogpost);
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
  }
);

// // LIKE OR DISLIKE A BLOGPOST (PURE JS WAY)
// blogpostsRouter.put("/:blogpostId/likeOrDislike", async (req, res, next) => {
//   try {
//     const blogpost = await BlogpostsModel.findById(req.params.blogpostId);
//     if (blogpost) {
//       if (!blogpost.likes.includes(req.body.authorId)) {
//         blogpost.likes.push(req.body.authorId);
//         await blogpost.save();
//         res.send({
//           message: "Blogpost liked!",
//           likes: blogpost.likes,
//           likesCount: blogpost.likes.length,
//         });
//       } else {
//         blogpost.likes = blogpost.likes.filter(
//           (id) => id.toString() !== req.body.authorId
//         );
//         await blogpost.save();
//         res.send({
//           message: "Blogpost disliked!",
//           likes: blogpost.likes,
//           likesCount: blogpost.likes.length,
//         });
//       }
//     } else {
//       createHttpError(
//         404,
//         `Blogpost with id ${req.params.blogpostId} not found!`
//       );
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// LIKE OR DISLIKE (MONGO WAY) thanks to -> https://github.com/batigokovali
blogpostsRouter.put("/:blogpostId/likeOrDislike", async (req, res, next) => {
  const blogpost = await BlogpostsModel.findById(req.params.blogpostId);
  if (blogpost) {
    if (!blogpost.likes.includes(req.body.authorId.toString())) {
      const updatedBlogpost = await BlogpostsModel.findByIdAndUpdate(
        req.params.blogpostId,
        { $push: { likes: req.body.authorId } },
        { new: true, runValidators: true }
      );
      res.send({
        message: "Blogpost liked!",
        likes: updatedBlogpost.likes,
        likesCount: updatedBlogpost.likes.length,
        isLiked: true,
      });
    } else {
      const updatedBlogpost = await BlogpostsModel.findByIdAndUpdate(
        req.params.blogpostId,
        { $pull: { likes: req.body.authorId } },
        { new: true, runValidators: true }
      );
      res.send({
        message: "Blogpost disliked!",
        likes: updatedBlogpost.likes,
        likesCount: updatedBlogpost.likes.length,
        isLiked: false,
      });
    }
  } else {
    createHttpError(
      404,
      `Blogpost with id ${req.params.blogpostId} not found!`
    );
  }
});

// DELETE
blogpostsRouter.delete(
  "/:blogpostId",
  basicAuth,
  adminOnly,
  async (req, res, next) => {
    try {
      const deletedBlogpost = await BlogpostsModel.findByIdAndDelete(
        req.params.blogpostId
      );
      if (deletedBlogpost) res.status(204).send();
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
  }
);

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
    const queryToMongo = q2m(req.query);
    const blogposts = await BlogpostsModel.find(queryToMongo.criteria);
    const blogpost = blogposts.find(
      (b) => b._id.toString() === req.params.blogpostId
    );
    if (blogposts.length > 0) {
      // FOR NOW IT ONLY WORKS IF THERE IS EVEN ONE COMMENT THAT MATCHES THE CRITERIA, AND SHOWS ALL THE COMMENTS OF THE SPECIFIC BLOGPOST! FURTHER JS FUNC. IS NEEDED.
      if (blogpost) {
        res.send(blogpost.comments);
      } else
        next(
          createHttpError(
            404,
            `Blogpost with id ${req.params.blogpostId} not found!`
          )
        );
    } else {
      next(
        createHttpError(404, "There is no comment matches the criteria(s))!")
      );
    }
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
    const blogpost = await BlogpostsModel.findById(req.params.blogpostId);
    if (blogpost) {
      const index = blogpost.comments.findIndex(
        (c) => c._id.toString() === req.params.commentId
      );
      if (index !== -1) {
        blogpost.comments[index] = {
          ...blogpost.comments[index].toObject(),
          ...req.body,
          updatedAt: new Date(),
        };
        await blogpost.save();
        res.send(blogpost.comments[index]);
      } else {
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
