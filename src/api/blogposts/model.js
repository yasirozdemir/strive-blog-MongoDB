import mongoose from "mongoose";
const { Schema, model } = mongoose;

const blogpostSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    author: {
      name: { type: String, required: true },
      avatar: { type: String, required: true },
    },
    content: { type: String, required: true },
  },
  {
    timestamps: true, // timestamps is false by default, by assigning it true makes MongoDB server to generate automatically createdAt and updatedAt
  }
);

export default model("Blogpost", blogpostSchema);
