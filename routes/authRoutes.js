const express = require("express");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const User = require("../schemas/userSchema");
const {
  createUser,
  loginUser,
  generateAccessToken,
} = require("../utilities/auth");

const router = express.Router();
const app = express();

app.use(cookieParser());

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Invalid email or password" });
    }
    const token = generateAccessToken(user._id); // Pass the userId directly

    // Set the token as a cookie in the response
    res.cookie("token", token, { httpOnly: true });
    res.send({ message: "Login successful", id: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    // Get the email and password from the request body
    const { username, email, password } = req.body;

    // Check if the email is already in use
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create a new user object
    const newUser = { username, email, password };

    // Create the new user in the database
    const confirmedUser = await createUser(newUser);

    // Return a success message
    return res
      .status(200)
      .json({ message: "User created successfully", id: confirmedUser._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
