const dotenv = require("dotenv");
// Loads in environment variables from a .env file into process.env
dotenv.config();
// console.log(process.env) // this has all our variable from .env
const express = require("express");
const app = express();
const authController = require("./controllers/auth.js");
const session = require("express-session");

const mongoose = require("mongoose");

const methodOverride = require("method-override");
const morgan = require("morgan");

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
// Morgan for logging HTTP requests
app.use(morgan("dev"));
// attach sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
// define a middleware to check is user logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/auth/sign-in");
  }
};

// ROUTES
app.get("/", (req, res) => {
  // res.send("hello friend")
  res.render("index.ejs", {
    user: req.session.user,
  });
});

// /auth/ + any route will be handled by authController
app.use("/auth", authController);

app.use(isLoggedIn) // any routes under this require login

app.get("/vip-lounge", isLoggedIn, (req, res) => {
  res.send("Welcome to the VIP lounge, " + req.session.user.username);
});


app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
