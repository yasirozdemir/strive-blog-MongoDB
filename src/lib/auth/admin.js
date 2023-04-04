import createHttpError from "http-errors";

export const adminOnly = (req, res, next) => {
  if (req.author.role === "admin") next();
  else next(createHttpError(403, "Access restricted. You're not an admin!"));
};
