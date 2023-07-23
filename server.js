const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// Connect to MongoDB (you'll need to replace 'your_mongodb_uri' with your actual MongoDB URI)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Import your routes
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const projectRoutes = require("./routes/projectRoutes");
const bugRoutes = require("./routes/bugRoutes");
const activityRoutes = require("./routes/activityRoutes");
const invitationRoutes = require("./routes/invitaionRoutes");
const authRoutes = require("./routes/authRoutes");

// Use the routes
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use("/projects", projectRoutes);
app.use("/bugs", bugRoutes);
app.use("/activities", activityRoutes);
app.use("/invitations", invitationRoutes);
app.use("/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("BugTracker Server is running");
});

// Start the server
app.listen(port, () => {
  console.log(`BugTracker Server is listening on port ${port}`);
});
