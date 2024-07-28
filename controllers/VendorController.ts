import { Request, Response, NextFunction } from "express";
import { CreateFoodInputs, EditVendorInputs, VendorLoginInput } from "../dto";
import { Food, Vendor } from "../models";
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

export const UpdateVendorProfileImage = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (user === undefined) {
      return res.status(200).json({
        error: true,
        message: "User not authnicate",
      });
    }
    const vendor = await Vendor.findOne({ _id: user._id });

    if (vendor === null) {
      return res.status(400).json({
        error: true,
        message: "No Such Vendor is Found:-(",
      });
    }

    const files = req.files as [Express.Multer.File];
    const images = files.map((file: Express.Multer.File) => file.filename);
    console.log(images);
    if (vendor.coverImages) {
      vendor.coverImages.push(...images);
    } else {
      vendor.coverImages = images;
    }
    await vendor.save();

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

export const AddFood = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (user === undefined) {
      return res.status(400).json({
        error: true,
        message: "User not authnicate",
      });
    }
    const { name, description, category, foodType, readyTime, price } = <
      CreateFoodInputs
    >req.body;
    const vendor = await Vendor.findOne({ _id: user.id });
    if (vendor === null) {
      return res.status(400).json({
        error: true,
        message: "No such vendor is found :-(",
      });
    }

    const files = req.files as [Express.Multer.File];
    const images = files.map((file: Express.Multer.File) => file.filename);

    const createdFood = await Food.create({
      vendorId: vendor._id,
      name,
      description,
      category,
      foodType,
      readyTime,
      images,
      price,
    });

    vendor.foods.push(createdFood);
    await vendor.save();

    ReturnData({ createdFood }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const GetFoods = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (user === undefined) {
      return res.status(400).json({
        error: true,
        message: "User not authnicate",
      });
    }
    const foods = await Food.find({ vendorId: user._id });
    return ReturnData({ foods }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: false,
      message: err.message,
    });
  }
};
