const express = require("express");
const router = express.Router();

const Activity = require("../schemas/activitySchema");

// Create a new activity entry
router.post("/", async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: "Failed to create activity" });
  }
});

// Retrieve recent activity
router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(10);
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve activity" });
  }
});

module.exports = router;
