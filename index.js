const express = require("express");
require("dotenv").config()
const clc = require("cli-color")
const session = require("express-session")
const mongoDbSession = require("connect-mongodb-session")(session)

const AuthRouter = require("./Controllers/AuthController")
const db = require("./db");
const BlogRouter = require("./Controllers/BlogController");
const isAuth = require("./Middlewares/isAuth");
const FollowRouter = require("./Controllers/FollowController");
const cleanUpBin = require("./cron");

const app = express();
const PORT = process.env.PORT || 8000;
const store = new mongoDbSession({
  uri:process.env.MONGO_URI,
  collection:"sessions"
})

//middlewares
app.use(express.json())
app.use(session({
  secret:process.env.SECRET_KEY,
  resave:false,
  saveUninitialized:false,
  store:store
}))

//Routes
app.use("/auth",AuthRouter)
app.use("/blog",isAuth,BlogRouter)
app.use("/follow",isAuth,FollowRouter)
  
app.get("/", (req, res) => {
  return res.send({
    status:200,
    message:"Server is running"
  });
});

app.listen(PORT, () => {
  console.log(clc.yellowBright(`Server is listening on port ${PORT}`));
  cleanUpBin()
});

