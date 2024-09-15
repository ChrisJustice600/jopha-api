const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
dotenv.config();

const PORT = process.env.PORT;
const app = express();

const authRouter = require("./src/routes/authRoutes");
const colisRouter = require("./src/routes/colisRoutes");
const groupageRouter = require("./src/routes/groupageRoutes");
const clientCode = require("./src/routes/clientCodeRouter");

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

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
app.use("/colis", colisRouter);
app.use("/groupages", groupageRouter);
app.use("/client", clientCode);

app.get("/", (req, res) => {
  res.send("<h1>Bienvenue au serveur C3</h1>");
});

app.listen(PORT, () => console.log(`server started on ${PORT}`));
