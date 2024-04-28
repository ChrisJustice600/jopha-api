const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const authRouter = require("./Routes/auth");

dotenv.config();
const PORT = process.env.PORT;
const app = express();

app.use(cookieParser());

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("<h1>Bienvenue au serveur C3</h1>");
});

app.listen(PORT, () => console.log(`server started on ${PORT}`));
