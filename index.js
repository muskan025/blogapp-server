const express = require("express");
require("dotenv").config();
const clc = require("cli-color");
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);
const upload = require("express-fileupload");

const db = require("./db");
const AuthRouter = require("./Controllers/AuthController");
const BlogRouter = require("./Controllers/BlogController");
const FollowRouter = require("./Controllers/FollowController");
const FileRouter = require("./Controllers/FileController");
const isAuth = require("./Middlewares/isAuth");
const cleanUpBin = require("./cron");
const uploadMiddleware = require("./Middlewares/uploadMiddleware");

const app = express();
const PORT = process.env.PORT || 8000;
const store = new mongoDbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

//middlewares
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: 3600000 },
  })
);

//Routes
app.use("/auth", AuthRouter);
app.use("/blog", isAuth, BlogRouter);
app.use("/follow", isAuth, FollowRouter);
app.use("/upload", isAuth, FileRouter);

//File Upload
app.use(upload());

// app.get("/upload", (req, res) => {
//   res.sendFile(__dirname + "/index.html");
// });
// app.post("/upload",isAuth,uploadMiddleware, (req, res) => {
//   try{
//     return res.send("File uploaded succesfully")
//   }
//   catch(error){
//     return res.send(error)
//   }
// });

app.get("/", (req, res) => {
  return res.send({
    status: 200,
    message: "Server is running",
  });
});

app.listen(PORT, () => {
  console.log(clc.yellowBright(`Server is listening on port ${PORT}`));
  cleanUpBin();
});
