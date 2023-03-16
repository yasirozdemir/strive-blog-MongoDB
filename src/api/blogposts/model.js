import mongoose from "mongoose";
const { Schema, model } = mongoose;

const blogpostSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true },
      unit: {
        type: String,
        required: true,
        enum: ["second", "minute", "hour"],
      },
    },
    author: { type: Schema.Types.ObjectId, ref: "Author" },
    content: { type: String, required: true },
    // likes: [{ type: Schema.Types.ObjectId, ref: "Author" }],
    comments: [
      {
        author: {
          name: { type: String, required: true },
          surname: { type: String, required: true },
          _id: { type: String, required: true },
        },
        rate: { type: Number, required: true },
        comment: { type: String, required: true },
        createdAt: Date,
        updatedAt: Date,
      },
    ],
  },
  {
    timestamps: true, // timestamps is false by default, by assigning it true makes MongoDB server to generate automatically createdAt and updatedAt
  }
);

blogpostSchema.static("findBlogpostAuthor", async function (mongoQuery) {
  const blogposts = await this.find(
    mongoQuery.criteria,
    mongoQuery.options.fields
  )
    .limit(mongoQuery.options.limit)
    .skip(mongoQuery.options.skip)
    .sort(mongoQuery.options.sort)
    .populate({ path: "author", select: "name surname" });
  const totalNumOfBlogposts = await this.countDocuments(mongoQuery.criteria);
  return { blogposts, totalNumOfBlogposts };
});

export default model("Blogpost", blogpostSchema);
