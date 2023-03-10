const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const fetchuser = require("../middlewares/fetchuser");
const { body, validationResult } = require("express-validator");

// Route 0: Fetch all the posts POST:/api/post/fetchallpost
router.get("/fetchallposts", fetchuser, async (req, res) => {
  const allPosts = await Post.find().populate("user");
  res.json(allPosts);
});

// Route 1: Add a new post POST:/api/post/addpost - login required
router.post(
  "/addpost",
  fetchuser,
  body("textData", "Cannot leave it blank!").isLength({ min: 1 }),
  async (req, res) => {
    try {
      const { image, imagePath, textData } = req.body;
      // check validation result
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const post = new Post({
        image,
        imagePath,
        textData,
        user: req.user.id,
      });

      const savedPost = await post.save();
      res.json({ success: "Post Uploaded Successfully!" });
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ error: "Internal Server Error!" });
    }
  }
);

// Route 2 : Get user's posts GET: /api/post/fetchusersposts - Login required

router.get("/fetchusersposts", fetchuser, async (req, res) => {
  let success = false;
  try {
    const posts = await Post.find({ user: req.user.id }).populate("user");
    res.json(posts);
  } catch (error) {
    console.log(success, error.message);
  }
});

// Route 3 : Delete an existing post DELETE: /api/post/deletepost  - Login required
router.delete("/deletepost/:id", fetchuser, async (req, res) => {
  let success = false;
  try {
    // check if the post exists
    let post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post Not Found");
    }

    // verify if the user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed!");
    }

    post = await Post.findByIdAndDelete(req.params.id);

    const comments = await Comment.find({ post: req.params.id });

    if (comments) {
      await Comment.deleteMany({ post: req.params.id });
    }

    let success = true;
    res.json({ success: "The post has been deleted", post, comments });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error!");
  }
});
// Route 4: Edit a post : /api/post/editpost/:id - Login required
router.put("/editpost/:id", fetchuser, async (req, res) => {
  let success = false;
  try {
    const { textData } = req.body;

    // new post object
    const newPost = {};

    if (textData) {
      newPost.textData = textData;
    }

    // Find the note to be updated and update it
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send("Not Found");
    }

    // verify if the user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed!");
    }

    post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: newPost },
      { new: true }
    );
    res.json({ success: "Post Updated Successfully!", post: post });
  } catch (error) {
    console.log(success, error.message);
    res.status(500).send("Internal Server Error!");
  }
});

// Route 5 : Like a post : /api/post/likepost/:id  - Login required
router.post("/likepost/:id", fetchuser, async (req, res) => {
  // let success = false

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send({ error: "Post not found" });

    const userLiked = post.likes.find(
      (like) => like.toString() === req.user.id.toString()
    );

    if (userLiked) return res.status(400).send({ error: "Already liked" });

    post.likes.push(req.user.id);
    await post.save();

    success = true;

    res.json({ success, post });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Route 6 : UnLike a post : /api/post/unlikepost/:id  - Login required

router.delete("/unlikepost/:id", fetchuser, async (req, res) => {
  let success = false;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send({ error: "Post not found" });

    // Check if the user has already liked the post
    const userLiked = post.likes.find(
      (like) => like.toString() === req.user.id.toString()
    );

    if (!userLiked) {
      return res.status(400).send({ error: "Not liked" });
    }

    post.likes = post.likes.filter(
      (like) => like.toString() !== req.user.id.toString()
    );
    await post.save();

    success = true;
    res.json({ success, post });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Route 7 : Bookmark a post : /api/post/bookmarkpost/:id - Login required
router.post("/bookmarkpost/:id", fetchuser, async (req, res) => {
  try {
    // Check if the post exist
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send({ error: "Post not found" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send({ error: "Post not found" });

    // check if the post is already bookmarked
    const alreadyBookmarked = user.bookmarkedPosts.find(
      (bookmark) => bookmark.toString() === req.params.id.toString()
    );

    if (alreadyBookmarked)
      return res.status(400).send({ error: "Already Bookmarked" });

    user.bookmarkedPosts.push(req.params.id);
    await user.save();

    success = true;

    res.json({ success: "Post Saved", post: post });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Route 8 : Delete bookmarked post : /api/post/deletebookmark/:id  - Login required

router.delete("/deletebookmark/:id", fetchuser, async (req, res) => {
  let success = false;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send({ error: "Post not found" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send({ error: "User not found" });

    // Check if the user has already liked the post
    const alreadyBookmarked = user.bookmarkedPosts.find(
      (bookmark) => bookmark.toString() === req.params.id.toString()
    );

    if (!alreadyBookmarked) {
      return res.status(400).send({ error: "Post is not bookmarked" });
    }

    user.bookmarkedPosts = user.bookmarkedPosts.filter(
      (bookmark) => bookmark.toString() !== req.params.id.toString()
    );
    await user.save();

    success = true;
    res.json({ success: "Post Removed", post: post });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Route 9 : Fetch bookmarked posts : /api/post/fetchbookmarks  - Login required

router.get("/fetchbookmarks", fetchuser, async (req, res) => {
  let success = false;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send({ error: "User not found" });

    const ids = user.bookmarkedPosts;
    const posts = await Post.find({ _id: { $in: ids } }).populate("user");

    res.json(posts);
  } catch (error) {
    console.log(success, error.message);
  }
});

module.exports = router;
