import jwt from "jsonwebtoken";
import AuthorsModel from "../../api/authors/model.js";
import createHttpError from "http-errors";
const { JWT_KEY, REFRESH_KEY } = process.env;

export const createTokens = async (author) => {
  const accessToken = await createAccessToken({
    _id: author._id,
    role: author.role,
  });
  const refreshToken = await createRefreshToken({ _id: author._id });
  author.refreshToken = refreshToken;
  await author.save();
  return { accessToken, refreshToken };
};

export const createAccessToken = (payload) =>
  // Input: payload, Output: Promise which resolves into the token
  new Promise((resolve, reject) =>
    jwt.sign(payload, JWT_KEY, { expiresIn: "15m" }, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    })
  );

export const verifyAccessToken = (token) =>
  // Input: token, Output: Promise which resolves into the original payload
  new Promise((resolve, reject) =>
    jwt.verify(token, JWT_KEY, (err, payload) => {
      if (err) reject(err);
      else resolve(payload);
    })
  );

const createRefreshToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, REFRESH_KEY, { expiresIn: "1 day" }, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    })
  );

const verifyRefreshToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, REFRESH_KEY, (err, payload) => {
      if (err) reject(err);
      else resolve(payload);
    })
  );

export const verifyCreateNewTokens = async (currentRefreshToken) => {
  try {
    const { _id } = await verifyRefreshToken(currentRefreshToken);
    const author = await AuthorsModel.findById(_id);
    if (!user)
      throw new createHttpError(404, `Author with id ${_id} not found!`);

    if (user.refreshToken && user.refreshToken === currentRefreshToken) {
      const { accessToken, refreshToken } = await createTokens(author);
      return { accessToken, refreshToken };
    }
  } catch (error) {
    throw new createHttpError(401, "Session expired! Log in again!");
  }
};
