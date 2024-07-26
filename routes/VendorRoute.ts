import express, { Request, Response, NextFunction } from "express";
const router = express.Router();

router.use("/", (req: Request, res: Response, next: NextFunction) => {
  return res.json("Hello From Vendor");
});

export { router as VendorRoute };
