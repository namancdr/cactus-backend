const express = require("express");
const router = express.Router();
const User = require("../models/User");
const fetchuser = require("../middlewares/fetchuser");
const Post = require("../models/Post");

// Route 0 : Upload profile picture : /api/user/uploadprofileppic  - Login required
router.post("/uploadprofilepic", fetchuser, async (req, res) => {
  let success = false;
  try {
    const { image, imagePath } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send({ error: "User not found" });

    user.image = image;
    user.imagePath = imagePath;
    user.save();
    success = true;
    res.json({ success: "Photo Uploaded Successfully!" });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Route 1 : Upload profile picture : /api/user/:id/uploadprofileppic  - Login required
router.delete("/deleteprofilepic", fetchuser, async (req, res) => {
  let success = false;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send({ error: "User not found" });

    user.image = null;
    user.imagePath = null;
    user.save();
    success = true;
    res.json({ success: "Photo deleted Successfully!" });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Route 2 : Follow a user : /api/user/:id/followuser  - Login required
router.post("/:id/followuser", fetchuser, async (req, res) => {
  let success = false;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send({ error: "User not found" });

    // Verify if the user is trying to follow it's own account and give error
    if (user._id.toString() === req.user.id.toString())
      return res.status(400).send({ error: "Request Denied!" });

    // Check if the user already follows the account
    const alreadyFollowed = user.followers.find(
      (follower) => follower.toString() === req.user.id.toString()
    );

    if (alreadyFollowed)
      return res.status(400).send({ error: "Already Followed" });

    // follow the account and save
    user.followers.push(req.user.id);
    await user.save();

    // also update the user's following
    const myAcc = await User.findById(req.user.id);
    if (!myAcc)
      return res
        .status(404)
        .send({ error: "Some error occured, please Login again" });

    myAcc.following.push(user._id);
    await myAcc.save();

    success = true;
    res.json({ success, message: "Followed Successfully!" });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

module.exports = router;

// Route 3 : Unfollow a user : /api/user/:id/unfollowuser  - Login required
router.post("/:id/unfollowuser", fetchuser, async (req, res) => {
  let success = false;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send({ error: "User not found" });

    if (user._id.toString() === req.user.id.toString())
      return res.status(400).send({ error: "Request Denied!" });

    // Check if the user follows the ther user
    const alreadyFollowed = user.followers.find(
      (follower) => follower.toString() === req.user.id.toString()
    );

    if (!alreadyFollowed) {
      return res.status(400).send({ error: "Not Followed" });
    }

    // unfollow the user and save
    user.followers = user.followers.filter(
      (follower) => follower.toString() !== req.user.id.toString()
    );
    await user.save();

    // also update the user's following
    const myAcc = await User.findById(req.user.id);
    if (!myAcc)
      return res
        .status(404)
        .send({ error: "Some error occured, please Login again" });

    myAcc.following = myAcc.following.filter(
      (following) => following.toString() !== user._id.toString()
    );
    await myAcc.save();

    success = true;
    res.json({ success, message: "Unfollowed Successfully!" });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Route 5: searchusers : /api/user/searchusers  - Login required
router.post("/searchusers", fetchuser, async (req, res) => {
  try {
    const { username } = req.body;
    const allUsers = await User.find({
      username: { $regex: username, $options: "i" },
    });
    res.status(200).send(allUsers);
  } catch (error) {
    res.status(500).send({ error: "Some error occured!" });
  }
});

// route 6: fetchotheruserdetails : /api/user/fetchotheruserdetails - login required
router.get("/fetchotheruserdetails/:username", fetchuser, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).send({ error: "User not found" });

    const posts = await Post.find({ user: user }).populate("user");

    res.send({ user, posts });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});
