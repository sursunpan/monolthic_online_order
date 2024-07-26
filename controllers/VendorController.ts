import { Request, Response, NextFunction } from "express";
import { EditVendorInputs, VendorLoginInput } from "../dto";
import { Vendor } from "../models";
import { GenerateSignature, ValidatePassword } from "../utility";
import { ReturnData } from "../utility/Returndata";

export const VendorLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = <VendorLoginInput>req.body;
    const vendor = await Vendor.findOne({ email: email });
    if (vendor === null) {
      return res.status(400).json({
        error: true,
        message: "No such vendor is found :-(",
      });
    }

    const comparePassword = await ValidatePassword(
      password,
      vendor.password,
      vendor.salt
    );
    if (comparePassword === false) {
      return res.status(400).json({
        error: true,
        message: "Password not matched :-(",
      });
    }

    const signature = await GenerateSignature({
      _id: vendor.id,
      id: vendor.id,
      email: vendor.email,
      foodTypes: vendor.foodTypes,
      name: vendor.name,
      phone: vendor.phone,
    });

    return ReturnData({ token: signature }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const Profile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (user === undefined) {
      return res.status(400).json({
        error: true,
        message: "User not authnicate",
      });
    }
    const vendor = await Vendor.findOne({ _id: user.id });
    return ReturnData({ vendor }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const UpdateVendorProfile = async (req: Request, res: Response) => {
  try {
    const { foodTypes, name, address, phone } = <EditVendorInputs>req.body;
    const user = req.user;
    if (user === undefined) {
      return res.status(400).json({
        error: true,
        message: "User not authnicate",
      });
    }
    const vendor = await Vendor.findOne({ _id: user.id });
    if (vendor === null) {
      return res.status(400).json({
        error: true,
        message: "No such vendor is found :-(",
      });
    }
    vendor.name = name;
    vendor.address = address;
    vendor.phone = phone;
    vendor.foodTypes = foodTypes;

    await vendor.save();
    return ReturnData({ vendor }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const UpdateVendorService = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (user === undefined) {
      return res.status(400).json({
        error: true,
        message: "User not authnicate",
      });
    }
    const vendor = await Vendor.findOne({ _id: user.id });
    if (vendor === null) {
      return res.status(400).json({
        error: true,
        message: "No such vendor is found :-(",
      });
    }

    vendor.serviceAvailable = !vendor.serviceAvailable;
    await vendor.save();
    return ReturnData({ vendor }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};
