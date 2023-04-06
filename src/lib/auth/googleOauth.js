import GoogleStrategy from "passport-google-oauth20";
import AuthorsModel from "../../api/authors/model.js";
import { createAccessToken } from "./tools.js";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, API_URL } = process.env;

const googleStrategy = new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${API_URL}/authors/me/googleRedirect`,
  },
  async (_, __, profile, passportNext) => {
    try {
      const { email, given_name, family_name, sub, picture } = profile._json;
      const author = await AuthorsModel.findOne({ email });
      if (author) {
        const accessToken = await createAccessToken({
          _id: author._id,
          role: author.role,
        });
        passportNext(null, { accessToken });
      } else {
        const newAuthor = new AuthorsModel({
          name: given_name,
          surname: family_name,
          email,
          googleId: sub,
          avatar: picture,
        });
        const createdAuthor = await newAuthor.save();
        const accessToken = await createAccessToken({
          _id: createdAuthor._id,
          role: createdAuthor.role,
        });
        passportNext(null, { accessToken });
      }
    } catch (error) {
      passportNext(error);
    }
  }
);

export default googleStrategy;
