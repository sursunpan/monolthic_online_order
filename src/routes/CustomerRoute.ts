import { Router } from "express";
import {
  AddToCart,
  CreateOrder,
  CreatePayment,
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
  VerifyOffer,
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = Router();

router.post("/signup", CustomerSignUp);
router.post("/login", CustomerLogin);
router.patch("/verify", Authenticate, CustomerVerify);
router.get("/otp", Authenticate, RequestOtp);
router.get("/profile", Authenticate, GetCustomerProfile);
router.patch("/profile", Authenticate, EditCustomerProfile);

router.post("/cart", Authenticate, AddToCart);
router.get("/cart", Authenticate, GetCart);
router.delete("/cart", Authenticate, DeleteCart);

router.get("/offer/verify/:id", Authenticate, VerifyOffer);

router.post("/create-order", Authenticate, CreateOrder);
router.post("/orders", Authenticate, GetOrders);
router.get("/order/:id", Authenticate, GetOrder);

router.post("/create-payment", Authenticate, CreatePayment);

export { router as CustomerRoute };
