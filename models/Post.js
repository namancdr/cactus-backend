const mongoose = require("mongoose");
const { Schema } = mongoose;

const PostSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  image: {
    type: String,
  },
  imagePath: {
    type: String,
  },
  textData: {
    type: String,
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});
const Post = mongoose.model("post", PostSchema);
module.exports = Post;
