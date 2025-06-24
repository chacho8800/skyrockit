const dotenv = require("dotenv");
// Loads in environment variables from a .env file into process.env
dotenv.config();
// console.log(process.env) // this has all our variable from .env
const express = require("express");
const app = express();
const authController = require("./controllers/auth.js");
const applicationController = require("./controllers/applications.js")
const session = require("express-session");

const IsSignedId = require("./middleware/is-signed-in.js")
const passUserToView = require("./middleware/pass-user-to-view.js")

const mongoose = require("mongoose");

const methodOverride = require("method-override");
const morgan = require("morgan");
const isSignedIn = require("./middleware/is-signed-in.js");

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";

const path = require("path")

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

app.use(express.static(path.join(__dirname, 'public')));


// attach sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passUserToView)


// ROUTES
app.get("/", (req, res) => {
  // res.send("hello friend")
  if(req.session.user) {
    res.redirect(`/users/${req.session.user._id}/applications`)
  } else {
    res.render("index.ejs")
  }
  
});

// /auth/ + any route will be handled by authController
app.use("/auth", authController);

app.use(isSignedIn)
// any routes under here are protected and use 
// must be signed in to acces them
/*
Action	Route	HTTP Verb
Index	'/users/:userId/applications'	GET
New	'/users/:userId/applications/new'	GET
Create	'/users/:userId/applications'	POST
Show	'/users/:userId/applications/:applicationId'	GET
Edit	'/users/:userId/applications/:applicationId/edit'	GET
Update	'/users/:userId/applications/:applicationId'	PUT
Delete	'/users/:userId/applications/:applicationId'	DELETE
*/
app.use("/users/:userId/applications", applicationController)

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
