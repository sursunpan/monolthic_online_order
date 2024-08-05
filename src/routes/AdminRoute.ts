import express, { Request, Response, NextFunction } from "express";
import {
  CreateVendor,
  GetTransactionById,
  GetTransactions,
  GetVendorById,
  GetVendors,
} from "../controllers";
const router = express.Router();

router.post("/vendor", CreateVendor);
router.get("/vendors", GetVendors);
router.get("/vendor/:id", GetVendorById);
router.get("/transaction", GetTransactions);
router.get("/transaction", GetTransactionById);

export { router as AdminRoute };
