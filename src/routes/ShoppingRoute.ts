import express, { Request, Response, NextFunction } from "express";
import {
  GetAvailableOffers,
  GetFoodAvailability,
  GetFoodIn30Min,
  GetTopRestaurants,
  RestaurantById,
  SearchFoods,
} from "../controllers";

const router = express.Router();

router.get("/:pincode", GetFoodAvailability);
router.get("/top-restaurants/:pincode", GetTopRestaurants);
router.get("/food-in-30-min/:pincode", GetFoodIn30Min);
router.get("/search/:pincode", SearchFoods);
router.get("/restaurant/:id", RestaurantById);
router.get("/offers/:pincode", GetAvailableOffers);

export { router as ShoppingRoute };
