import { Request, Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import { Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      ownerName,
      foodType,
      pincode,
      address,
      phone,
      email,
      password,
    } = <CreateVendorInput>req.body;

    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({
        error: true,
        message: "This Vendor already exist in our db :-)",
      });
    }

    const salt = await GenerateSalt(); // Generate Salt
    const userPassword = await GeneratePassword(password, salt); // Generate Password with help of Salt

    const createVendor = await Vendor.create({
      name,
      owner: ownerName,
      foodType,
      pincode,
      address,
      phone,
      email,
      password: userPassword,
      salt,
      rating: 0,
      serviceAvailable: false,
      coverImages: [],
    });

    return res.status(200).json({
      error: false,
      createVendor,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const GetVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const GetVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
