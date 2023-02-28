const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  image: {
    type: String,
  },
  imagePath: {
    type: String
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  about: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  bookmarkedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  followers: [
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

const User = mongoose.model("user", UserSchema);
module.exports = User;
