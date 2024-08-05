import express, { Request, Response, NextFunction } from "express";
import {
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

export { router as ShoppingRoute };
