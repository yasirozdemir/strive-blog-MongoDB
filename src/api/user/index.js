import Express from "express";
import { basicAuth } from "../../lib/auth/basicAuth.js";
import AuthorsModel from "../authors/model.js";

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

export default UserRouter;
