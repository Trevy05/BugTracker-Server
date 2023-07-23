const express = require("express");
const router = express.Router();
const Team = require("../schemas/teamSchema");
const User = require("../schemas/userSchema");

// CREATE a team
router.post("/", async (req, res) => {
  try {
    const team = new Team(req.body);
    const savedTeam = await team.save();
    res.json(savedTeam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  const userId = req.headers.authorization; // assuming you're passing the JWT token in the Authorization header

  try {
    const team = await Team.find({
      $or: [{ admins: userId }, { members: userId }],
    });
    res.json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all members and admins for a project
router.get("/:teamId/members", async (req, res) => {
  const teamId = req.params.teamId;

  try {
    // Find the team associated with the project
    const team = await Team.findOne({ _id: teamId });

    if (!team) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Fetch all the user IDs for members and admins
    const memberIds = team.members.map((member) => member._id);
    const adminIds = team.admins.map((admin) => admin._id);

    // Fetch the user details for members and admins
    const members = await User.find({ _id: { $in: memberIds } });
    const admins = await User.find({ _id: { $in: adminIds } });

    res.json({ members, admins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a team member
router.delete("/:teamId/members/:memberId/", async (req, res) => {
  const teamId = req.params.teamId;
  const memberId = req.params.memberId;

  try {
    // Find the team associated with the teamId
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if the user making the request is an admin of the team
    const currentUser = req.headers.authorization; // Assuming you have the user ID available in req.user.id
    if (!team.admins.includes(currentUser)) {
      return res
        .status(403)
        .json({ message: "You are not an admin of this team" });
    }

    // Remove the member with the given ID from the members array
    team.members = team.members.filter((member) => {
      member._id.toString() !== memberId.toString();
    });

    // Save the updated team
    const updatedTeam = await team.save();
    res.json(updatedTeam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ a team
router.get("/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    res.json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE a team
router.patch("/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const currentUser = req.body.currentUser;
    if (!currentUser) {
      return res.status(400).json({ message: "Current user ID is required" });
    }

    const isAdmin = team.admins.includes(currentUser);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Current user is not an admin of the team" });
    }

    if (req.body.formData.name) {
      team.name = req.body.formData.name;
    }
    if (req.body.formData.users) {
      team.users = req.body.formData.users;
    }

    const updatedTeam = await team.save();
    res.json(updatedTeam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a team
router.delete("/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    await team.deleteOne();
    res.json({ message: "Team deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
