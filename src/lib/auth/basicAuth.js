import createHttpError from "http-errors";
import atob from "atob";
import AuthorsModel from "../../api/authors/model.js";

export const basicAuth = async (req, res, next) => {
  if (req.headers.authorization) {
    const credentials = atob(req.headers.authorization.split(" ")[1]);
    const [email, password] = credentials.split(":");
    const author = await AuthorsModel.checkCreditentials(email, password);
    if (author) {
      req.author = author;
      next();
    } else {
      next(createHttpError(401, "Wrong creditentials!"));
    }
  } else
    next(createHttpError(401, "You've to provide the authorization header!"));
};
