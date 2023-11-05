import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose, { mongo } from "mongoose";
import router from "./router";
require("dotenv").config();

const app = express();

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use("/", router());

const server = http.createServer(app);

const MONGO_URI = process.env.DB_URI;

mongoose.Promise = Promise;
mongoose.connect(MONGO_URI);
mongoose.connection.on("error", (error: Error) => console.log(error));

server.listen(4000, () => {
  console.log("Server listening on port 4000");
});
