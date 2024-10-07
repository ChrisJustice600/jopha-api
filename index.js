const express = require("express");
const config = require("./config/environment");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const routes = require("./src/routes");

dotenv.config();

const app = express();
app.use(helmet());

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

app.use("/", routes);

app.listen(config.PORT, () => console.log(`server started on ${config.PORT}`));
