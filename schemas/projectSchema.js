const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  repoUrl: {
    type: String,
  },
  liveUrl: {
    type: String,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team", // Reference to Team schema, assuming you have a Team schema defined
    required: true,
  },
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
