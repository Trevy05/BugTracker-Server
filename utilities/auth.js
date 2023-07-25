const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../schemas/userSchema");
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

function createUser(user) {
  // Generate a salt and hash for the password
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(user.password, salt);

  // Create the new user object
  const newUser = new User({
    username: user.username,
    email: user.email,
    password: hash,
  });

  // Save the new user object to the database
  return newUser.save();
}

function generateAccessToken(user) {
  const payload = user.toString();
  return jwt.sign(payload, jwtSecret);
}

module.exports = {
  verifyToken,
  generateAccessToken,
  createUser,
};
