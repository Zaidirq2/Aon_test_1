const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/login", (req, res) => {
  let { username, password } = req.body;
  let token = userController.login(username, password);

  if(!token) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ token });
});

module.exports = router;