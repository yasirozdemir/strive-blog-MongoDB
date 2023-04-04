import Express from "express";
import createHttpError from "http-errors";
import AuthorsModel from "./model.js";
import q2m from "query-to-mongo";
import { basicAuth } from "../../lib/auth/basicAuth.js";
import { adminOnly } from "../../lib/auth/admin.js";

const authorsRouter = Express.Router();

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new AuthorsModel(req.body);
    const { _id } = await newAuthor.save();
    res
      .status(201)
      .send({ message: "New author successfully created!", id: _id });
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/", basicAuth, adminOnly, async (req, res, next) => {
  try {
    const queryToMongo = q2m(req.query);
    const authors = await AuthorsModel.find(
      queryToMongo.criteria,
      queryToMongo.options.fields
    )
      .limit(queryToMongo.options.limit)
      .skip(queryToMongo.options.skip)
      .sort(queryToMongo.options.sort);
    const totalNumOfAuthors = await AuthorsModel.countDocuments(
      queryToMongo.criteria
    );
    res.send({
      links: queryToMongo.links(
        "http://localhost:3001/authors",
        totalNumOfAuthors
      ),
      totalNumOfAuthors,
      authors,
    });
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/:authorId", async (req, res, next) => {
  try {
    const author = await AuthorsModel.findById(req.params.authorId);
    if (author) res.send(author);
    else
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      );
  } catch (error) {
    next(error);
  }
});

authorsRouter.put("/:authorId", async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
      req.params.authorId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedAuthor) res.send(updatedAuthor);
    else
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      );
  } catch (error) {
    next(error);
  }
});

authorsRouter.delete("/:authorId", async (req, res, next) => {
  try {
    const deletedAuthor = await AuthorsModel.findByIdAndDelete(
      req.params.authorId
    );
    if (deletedAuthor) res.status(204).send();
    else
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      );
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;
