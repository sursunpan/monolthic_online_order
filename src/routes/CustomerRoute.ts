import { Router } from "express";
import {
  AddToCart,
  CreateOrder,
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  DeleteCart,
  EditCustomerProfile,
  GetCart,
  GetCustomerProfile,
  GetOrder,
  GetOrders,
  RequestOtp,
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = Router();

router.post("/signup", CustomerSignUp);
router.post("/login", CustomerLogin);
router.patch("/verify", Authenticate, CustomerVerify);
router.get("/otp", Authenticate, RequestOtp);
router.get("/profile", Authenticate, GetCustomerProfile);
router.patch("/profile", Authenticate, EditCustomerProfile);

router.post("/cart", AddToCart);
router.get("/cart", GetCart);
router.delete("/cart", DeleteCart);

router.post("/create-order", Authenticate, CreateOrder);
router.post("/orders", Authenticate, GetOrders);
router.get("/order/:id", Authenticate, GetOrder);

export { router as CustomerRoute };
