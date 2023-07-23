const express = require("express");
const router = express.Router();

// Import your schema models here
const User = require("../schemas/userSchema");
const Project = require("../schemas/projectSchema");
const Ticket = require("../schemas/bugSchema");

router.get("/recent-activity", async (req, res) => {
  try {
    // Query all relevant collections and combine the results
    const users = await User.find().sort({ updatedAt: -1 }).limit(10);
    const projects = await Project.find().sort({ updatedAt: -1 }).limit(10);
    const tickets = await Ticket.find().sort({ updatedAt: -1 }).limit(10);

    // Combine the results into one array
    const recentActivity = [...users, ...projects, ...tickets];

    // Sort the combined array by updatedAt timestamp
    recentActivity.sort((a, b) => {
      if (a.updatedAt < b.updatedAt) {
        return 1;
      } else if (a.updatedAt > b.updatedAt) {
        return -1;
      } else {
        return 0;
      }
    });

    // Send the response with the combined and sorted array
    res.json(recentActivity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
