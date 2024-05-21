const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
// const cors = require("cors");
dotenv.config();

const PORT = process.env.PORT;
const app = express();

const authRouter = require("./Routes/auth");
const usersRouter = require("./Routes/users");
const { verifyToken } = require("./config/jwtconfig");
// app.use(
//   cors({
//     origin: "https://impact-ten.vercel.app/",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true,
//     optionsSuccessStatus: 204,
//   })
// );
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(cookieParser());

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Hello word");
});
app.use("/auth", authRouter);
app.use("/users", usersRouter);

app.get("/", (req, res) => {
  res.send("<h1>Bienvenue au serveur C3</h1>");
});

app.listen(PORT, () => console.log(`server started on ${PORT}`));
