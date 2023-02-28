const express = require("express");
const router = express.Router();
const User = require("../models/User");
const fetchuser = require("../middlewares/fetchuser");

// Route 0 : Upload profile picture : /api/user/uploadprofileppic  - Login required
router.post("/uploadprofilepic", fetchuser, async (req, res) => {
  let success = false;
  try {
    const { image, imagePath } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send({ error: "User not found" });

    // const newData = {}

    // if(image, imagePath){
    //     newData.image = image,
    //     newData.imagePath = imagePath
    // }

    user.image = image;
    user.imagePath = imagePath;
    user.save();
    success = true;
    res.json({ success: "Photo Uploaded Successfully!" });

  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Route 0 : Upload profile picture : /api/user/:id/uploadprofileppic  - Login required
router.delete("/deleteprofilepic", fetchuser, async (req, res) => {
  let success = false;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send({ error: "User not found" });

    user.image = null;
    user.imagePath = null
    user.save();
    success = true;
    res.json({ success: "Photo deleted Successfully!" });
   
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Route 0 : Follow a user : /api/user/:id/followuser  - Login required
router.post("/:id/followuser", fetchuser, async (req, res) => {
  let success = false;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send({ error: "User not found" });

    if (user._id.toString() === req.user.id.toString())
      return res.status(400).send({ error: "Request Denied!" });

    const alreadyFollowed = user.followers.find(
      (follower) => follower.toString() === req.user.id.toString()
    );

    if (alreadyFollowed)
      return res.status(400).send({ error: "Already Followed" });

    user.followers.push(req.user.id);
    await user.save();

    success = true;
    res.json({ success, message: "Followed Successfully!" });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

module.exports = router;

// Route 1 : Unfollow a user : /api/user/:id/unfollowuser  - Login required
router.delete("/:id/unfollowuser", fetchuser, async (req, res) => {
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

    user.followers = user.followers.filter(
      (follower) => follower.toString() !== req.user.id.toString()
    );
    await user.save();

    success = true;
    res.json({ success, message: "Unfollowed Successfully!" });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Route 2: fetchallusers : /api/user/fetchallusers  - Login required
router.get("/fetchallusers", fetchuser, async (req, res) => {
  const allUsers = await User.find();
  res.json(allUsers);
});
