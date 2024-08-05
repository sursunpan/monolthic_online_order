import { Request, Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import { Transaction, Vendor } from "../models";
import {
  GeneratePassword,
  GenerateSalt,
  NotFound,
  ReturnData,
  ServerError,
} from "../utility";

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      ownerName,
      foodTypes,
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
      foodTypes,
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
) => {
  try {
    const vendors = await Vendor.find();
    return res.status(200).json({
      error: false,
      vendors,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const GetVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id);

    if (vendor === null) {
      return res.status(400).json({
        error: true,
        message: "No such vendor",
      });
    }

    return res.status(200).json({
      error: false,
      vendor,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const GetTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find({});
    return ReturnData({ transactions }, res);
  } catch (err: any) {
    return ServerError(err.message, res);
  }
};

export const GetTransactionById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const transaction = await Transaction.findById(id);
    if (transaction === null) {
      return NotFound("No such transcation happen", res);
    }

    return ReturnData({ transaction }, res);
  } catch (err: any) {
    return ServerError(err.message, res);
  }
};
