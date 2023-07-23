const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
    enum: ["Low", "Medium", "High"],
  },
  status: {
    type: String,
    required: true,
    enum: ["Open", "In Progress", "Resolved"],
  },
  type: {
    type: String,
    required: true,
    enum: ["Bug", "Feature", "Enhancement"],
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User schema, assuming you have a User schema defined
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project", // Reference to Project schema, assuming you have a Project schema defined
  },
});

const Bug = mongoose.model("Bug", bugSchema);

module.exports = Bug;
