import { Router } from "express";
import {
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  EditCustomerProfile,
  GetCustomerProfile,
  RequestOtp,
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = Router();

router.post("/signup", CustomerSignUp);
router.post("/login", CustomerLogin);
router.patch("/verify", Authenticate, CustomerVerify);
router.get("/otp", RequestOtp);
router.get("/profile", GetCustomerProfile);
router.patch("/profile", EditCustomerProfile);

export { router as CustomerRoute };
