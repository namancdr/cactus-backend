const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const fetchuser = require("../middlewares/fetchuser");
const { body, validationResult } = require("express-validator");

// Route 0 : fetch all comment
router.get("/fetchallcomments", fetchuser, async (req, res) => {
  const allComments = await Comment.find().populate("user").populate("post");
  res.json(allComments);
});

//Route 1 : create a comment
router.post(
  "/:id/createcomment",
  fetchuser,
  body("commentText", "Cannot leave it blank!").isLength({ min: 1 }),
  async (req, res) => {
    try {
      const { commentText } = req.body;
      const post = req.params.id;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const comment = new Comment({ user: req.user.id, post, commentText });

      const savedComment = await comment.save();
      res.json({ success: "Comment Uploaded Successfully!" });
    } catch (error) {
      console.error(error);
    }
  }
);

module.exports = router;
