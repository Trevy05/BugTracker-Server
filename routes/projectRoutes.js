const express = require("express");
const router = express.Router();
const Project = require("../schemas/projectSchema");
const Team = require("../schemas/teamSchema");

const checkTeamMembership = async (req, res, next) => {
  const teamId = req.params.teamId;
  const projectId = req.params.projectId;
  const userId = req.user._id;

  // Check if the user is a member of the team
  const team = await Team.findOne({ _id: teamId, members: userId });
  if (!team) {
    return res
      .status(401)
      .json({ message: "You are not a member of this team" });
  }

  // Check if the project belongs to the team
  const project = await Project.findOne({ _id: projectId, team: teamId });
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  req.team = team;
  req.project = project;
  next();
};

// Get all projects
router.get("/", async (req, res) => {
  const userId = req.headers.authorization;

  try {
    // Get the teams that the user is a part of
    const teams = await Team.find({
      $or: [
        { members: { $elemMatch: { $eq: userId } } },
        { admins: { $elemMatch: { $eq: userId } } },
      ],
    });

    // Get an array of team IDs
    const teamIds = teams.map((team) => team._id);

    // Find projects where the team field matches one of the user's teams
    const projects = await Project.find({ team: { $in: teamIds } });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a project
router.post("/", async (req, res) => {
  const project = new Project({
    title: req.body.title,
    description: req.body.description,
    repoUrl: req.body.repoUrl,
    liveUrl: req.body.liveUrl,
    team: req.body.team,
  });

  try {
    const newProject = await project.save();

    await Team.findByIdAndUpdate(req.body.team, {
      $addToSet: { projects: newProject._id },
    });

    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a project
router.patch("/:id", getProject, async (req, res) => {
  if (req.body.title != null) {
    res.project.title = req.body.title;
  }
  if (req.body.description != null) {
    res.project.description = req.body.description;
  }
  if (req.body.repoUrl != null) {
    res.project.repoUrl = req.body.repoUrl;
  }
  if (req.body.liveUrl != null) {
    res.project.liveUrl = req.body.liveUrl;
  }

  try {
    const updatedProject = await res.project.save();
    res.json(updatedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a project
router.delete("/delete/:id", getProject, async (req, res) => {
  const id = res.project._id;

  const deletedProject = await Project.findByIdAndDelete(id);

  try {
    await Project.findByIdAndRemove(id);
    await Team.findByIdAndUpdate(deletedProject.team, {
      $pull: { projects: deletedProject._id },
    });
    res.json({ message: "Deleted project" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get a project by ID
async function getProject(req, res, next) {
  let project;
  try {
    project = await Project.findById(req.params.id);
    if (project == null) {
      return res.status(404).json({ message: "Cannot find project" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.project = project;
  next();
}

module.exports = router;
