import { NextFunction, Request, Response } from "express";
import { FoodDoc, Vendor } from "../models";
import { ReturnData } from "../utility/statusCode";

export const GetFoodAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pincode = req.params.pincode;
    const foods = await Vendor.find({ pincode, serviceAvailable: true })
      .sort([["rating", "descending"]])
      .populate("foods");

    return ReturnData({ foods }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const GetTopRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pincode = req.params.pincode;
    const restaurants = await Vendor.find({ pincode, serviceAvailable: true })
      .sort([["rating", "descending"]])
      .limit(10);

    return ReturnData({ restaurants }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const GetFoodIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pincode = req.params.pincode;
    const foods = await Vendor.find({
      pincode,
      serviceAvailable: true,
    }).populate("foods");

    let foodIn30Min: any = [];
    if (foods.length > 0) {
      foods.map((vendor) => {
        const vendorFood = vendor.foods as [FoodDoc];
        foodIn30Min.push(...vendorFood.filter((food) => food.readyTime <= 30));
      });
    }

    return ReturnData({ foodIn30Min }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const SearchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pincode = req.params.pincode;
    const foods = await Vendor.find({
      pincode,
      serviceAvailable: true,
    }).populate("foods");

    let foodResult: any = [];
    if (foods.length > 0) {
      foods.map((item) => foodResult.push(...item.foods));
    }

    return ReturnData({ foodResult }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const RestaurantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const vendor = await Vendor.findOne({ _id: id }).populate("foods");

    return ReturnData({ vendor }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};
