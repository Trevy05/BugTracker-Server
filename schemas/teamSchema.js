const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User schema, assuming you have a User schema defined
    },
  ],
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User schema, assuming you have a User schema defined
    },
  ],
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
