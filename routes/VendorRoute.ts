import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import {
  AddFood,
  GetFoods,
  Profile,
  UpdateVendorProfile,
  UpdateVendorProfileImage,
  UpdateVendorService,
  VendorLogin,
} from "../controllers";
import { Authenticate } from "../middlewares";
const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + "_" + file.originalname);
  },
});

const images = multer({ storage: imageStorage }).array("images", 10);

router.post("/login", VendorLogin);

router.get("/profile", Authenticate, Profile);
router.patch("/profile", Authenticate, UpdateVendorProfile);
router.patch("/service", Authenticate, UpdateVendorService);
router.patch("/updateprofile", Authenticate, images, UpdateVendorProfileImage);

router.post("/food", Authenticate, images, AddFood);
router.get("/foods", Authenticate, GetFoods);

export { router as VendorRoute };
