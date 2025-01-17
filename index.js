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
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

const allowedOrigins = [
  "https://jopha-front.vercel.app",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware pour parser les cookies
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use("/", routes);

app.listen(config.PORT, () => console.log(`server started on ${config.PORT}`));
