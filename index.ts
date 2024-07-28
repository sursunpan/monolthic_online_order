import express from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { AdminRoute, VendorRoute } from "./routes";
import { MONGO_URI } from "./config";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));
mongoose
  .connect(MONGO_URI)
  .then((result) => {
    // console.log(result);
    console.log("Connected");
  })
  .catch((err) => console.log(err));

app.use("/vendor", VendorRoute);
app.use("/admin", AdminRoute);

app.listen(8000, () => {
  console.log("APP start listening on Port 8000");
});
