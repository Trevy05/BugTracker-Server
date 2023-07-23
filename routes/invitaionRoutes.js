const router = require("express").Router();
let Invitation = require("../schemas/invitationSchema");
let User = require("../schemas/userSchema");
let Team = require("../schemas/teamSchema");

router.get("/requests/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Check if user ID is valid
    const validUser = await User.findById(userId);

    if (!validUser) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Get all requests where user is the recipient
    const invitation = await Invitation.find({ recipient: userId }).populate(
      "sender team"
    );

    res.json(invitation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/requests", async (req, res) => {
  try {
    const { sender, recipient, team, message } = req.body;

    // Check if sender and recipient are valid user IDs
    const validSender = await User.findById(sender);
    const validRecipient = await User.findById(recipient);

    if (!validSender || !validRecipient) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Check if team is a valid team ID
    const validTeam = await Team.findById(team);

    if (!validTeam) {
      return res.status(400).json({ message: "Invalid team ID" });
    }

    const existingInvitation = await Invitation.findOne({
      sender: sender,
      recipient: recipient,
      team: team,
    });

    if (existingInvitation) {
      return res.status(400).json({ message: "Invitation already sent" });
    }

    // Create new request
    const newInvitation = new Invitation({
      sender,
      recipient,
      team,
      message,
    });

    await newInvitation.save();
    res.status(201).json(newInvitation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/requests/:id/accept", async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: "invitation not found" });
    }

    invitation.status = "accepted";

    // Add recipient to team members array
    await Team.findByIdAndUpdate(invitation.team, {
      $addToSet: { members: invitation.recipient },
    });

    await invitation.save();

    res.json(invitation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/requests/:id/reject", async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: "invitation not found" });
    }

    invitation.status = "rejected";
    await invitation.save();

    res.json(invitation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
