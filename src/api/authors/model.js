import mongoose from "mongoose";
const { Schema, model } = mongoose;
import bcrypt from "bcrypt";

const AuthorsSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, reqired: true },
    avatar: { type: String, required: true, default: " " },
    googleId: { type: String },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

AuthorsSchema.pre("save", async function () {
  const newAuthorData = this;
  if (newAuthorData.isModified("password")) {
    const plainPw = newAuthorData.password;
    const hashedPw = await bcrypt.hash(plainPw, 10);
    newAuthorData.password = hashedPw;
  }
});

AuthorsSchema.methods.toJSON = function () {
  const author = this.toObject();
  delete author.__v;
  delete author.password;
  delete author.refreshToken;
  return author;
};

AuthorsSchema.static("checkCreditentials", async function (email, password) {
  const author = await this.findOne({ email });
  if (author) {
    const passwordMatch = await bcrypt.compare(password, author.password);
    if (passwordMatch) return author;
    else return null;
  } else return null;
});

export default model("Author", AuthorsSchema);
