const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middlewares/fetchuser");

const JWT_SECRET = process.env.JWT_SECRET;

// Route 1: SIGNUP- Create a user POST: /api/auth/createuser
router.post(
  "/createuser",

  body("username", "Username must contain atleast 2 characters").isLength({
    min: 2,
  }),
  body("name", "Name must contain atleast 2 characters").isLength({ min: 2 }),
  body("email", "Enter a valid email").isEmail(),
  body("password", "Password must contain atleast 5 characters").isLength({
    min: 5,
  }),
  async (req, res) => {
    let success = false;

    // check validation result
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      // check weather the user with same email already exist
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          success,
          error:
            "Sorry a user with this email already exist! Try to login instead.",
        });
      }

      // generate encrypted password
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error!");
    }
  }
);

// Route 2: LOGIN- Authenticate a user POST: /api/auth/login
router.post(
  "/login",
  body("email", "Enter a valid email").isEmail(),
  body("password", "Password should be alteast 5 character long").exists(),
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success,
          error: "Sorry! User with this email does not exist.",
        });
      }

      const comparePassword = await bcrypt.compare(password, user.password);

      if (!comparePassword) {
        return res.status(400).json({ success, error: "Incorrect Password!" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error!");
    }
  }
);

// Route 3: Get logged in user detaila POST: /api/auth/getuser
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server erro");
  }
});

module.exports = router;
