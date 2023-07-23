const router = require("express").Router();
let Bug = require("../schemas/bugSchema");
let Project = require("../schemas/projectSchema");
let Team = require("../schemas/teamSchema");
let Activity = require("../schemas/activitySchema");

// Route to get a bug
router.route("/").get(async (req, res) => {
  try {
    const currentUser = req.headers.currentuser;
    const userTeams = await Team.find({
      $or: [{ members: currentUser }, { admins: currentUser }],
    }).select("_id");

    const projects = await Project.find({ team: { $in: userTeams } }).select(
      "_id"
    );
    const bugs = await Bug.find({ project: { $in: projects } });
    res.status(200).json(bugs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to create a new bug

router.post("/", async (req, res) => {
  const currentUser = req.headers.currentuser;
  try {
    const { title, description, priority, status, type, assignedTo, project } =
      req.body;
    const bug = new Bug({
      title,
      description,
      priority,
      status,
      type,
      assignedTo,
      project,
    });
    await bug.save();
    // Update the corresponding project's bugs array with the new bug ID
    const projectToUpdate = await Project.findOneAndUpdate(
      { _id: project },
      { $push: { bugs: bug._id } },
      { new: true }
    );

    const activity = new Activity({
      type: "Bug Created",
      entityId: bug._id,
      userId: currentUser,
      details: `Bug ${bug.title} has been created for ${projectToUpdate.title}.`,
    });
    await activity.save();
    res.status(201).json(bug);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Route to edit a bug by ID
router.put("/:id", async (req, res) => {
  const currentUser = req.headers.currentuser;

  try {
    const { id } = req.params;
    const bug = await Bug.findByIdAndUpdate(id, req.body, { new: true });

    const activity = new Activity({
      type: "Bug Updated",
      entityId: bug._id,
      userId: currentUser,
      details: `Bug ${bug.title} has been updated.`,
    });

    await activity.save();
    res.json(bug);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Route to delete a bug by ID
router.delete("/delete/:id", async (req, res) => {
  const currentUser = req.headers.currentuser;
  try {
    const { id } = req.params;
    const bug = await Bug.findByIdAndRemove(id);

    // Remove the bug id from the corresponding project's bugs array
    const project = await Project.findOneAndUpdate(
      { bugs: id },
      { $pull: { bugs: id } }
    );

    const activity = new Activity({
      type: "Bug Deleted",
      entityId: bug._id,
      userId: currentUser,
      details: `Bug ${bug.title} has been deleted.`,
    });

    await activity.save();

    res.json(bug);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Export the router
module.exports = router;
