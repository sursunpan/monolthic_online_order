import express, { Request, Response, NextFunction } from "express";
import {
  Profile,
  UpdateVendorProfile,
  UpdateVendorService,
  VendorLogin,
} from "../controllers";
import { Authenticate } from "../middlewares";
const router = express.Router();

router.post("/login", VendorLogin);

router.get("/profile", Authenticate, Profile);
router.patch("/profile", Authenticate, UpdateVendorProfile);
router.patch("/service", Authenticate, UpdateVendorService);

export { router as VendorRoute };
