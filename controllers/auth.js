const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

// Define our auth routes
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});

router.post("/sign-up", async (req, res) => {
  // res.send("Got your info" + req.body.username)
  const userInDatabase = await User.findOne({ username: req.body.username });

  if (userInDatabase) {
    return res.send("User already exists");
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res.send("Passwords do not match");
  }

  // hash the password with bcrypt

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  req.body.password = hashedPassword;

  const newUser = await User.create(req.body);

  res.send("Welcome " + newUser.username);
});

router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});

router.post("/sign-in", async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username });
  if (!userInDatabase) {
    return res.send("User does not exist");
  }

  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  );

  if (!validPassword) {
    return res.send("Log in failed. Please try again.");
  }

  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id
  };
  req.session.helloWold = "Hello World";
  /*

    {
        username: "billie",
        helloWorld: "Hello World"
     };
 */
  res.redirect("/");
});



router.get("/sign-out", (req, res) =>{
    req.session.destroy()
    res.redirect("/")
})

module.exports = router;
