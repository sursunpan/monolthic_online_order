import { Request, Response, NextFunction } from "express";
import {
  CreateFoodInputs,
  CreateOfferInputs,
  EditVendorInputs,
  VendorLoginInput,
} from "../dto";
import { Food, OfferModel, Vendor } from "../models";
import { GenerateSignature, ValidatePassword } from "../utility";
import {
  AuthenticateError,
  NotFound,
  ReturnData,
  ServerError,
} from "../utility/statusCode";
import { Order } from "../models/Order";

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

export const GetCurrentOrders = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (user === undefined)
      return AuthenticateError("No such user is Found!!", res);

    const orders = await Order.find({ vendorId: user._id }).populate(
      "items.food"
    );
    return ReturnData({ orders }, res);
  } catch (err: any) {
    return ServerError(err.message, res);
  }
};

export const GetOrderDetails = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate("items.food");
    return ReturnData({ order }, res);
  } catch (err: any) {
    return ServerError(err.message, res);
  }
};

export const ProcessOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status, remarks, time } = req.body;
    const order = await Order.findById(orderId).populate("food");
    if (order === null) return NotFound("This order is not found", res);
    order.orderStauts = status;
    order.remarks = remarks;
    if (time) {
      order.readyTime = time;
    }

    await order.save();
    return ReturnData({ order }, res);
  } catch (err: any) {
    return ServerError(err.message, res);
  }
};

export const GetOffers = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (user === undefined) {
      return AuthenticateError("User is Authorize", res);
    }
    const offers = await OfferModel.find().populate("vendors");
    let currentOffers = Array();
    if (offers.length > 0) {
      offers.map((item) => {
        if (item.vendors) {
          item.vendors.map((vendor) => {
            if (vendor._id.toString() === user._id) {
              currentOffers.push(item);
            }
          });
        }
        if (item.offerType === "GENERIC") {
          currentOffers.push(item);
        }
      });
    }
    return ReturnData({ currentOffers }, res);
  } catch (err: any) {
    return ServerError(err.message, res);
  }
};

export const AddOffer = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (user === undefined) {
      return AuthenticateError("Not Authorized!!", res);
    }
    const {
      title,
      description,
      offerAmount,
      offerType,
      pincode,
      promoCode,
      promoType,
      startValidity,
      endValidaity,
      bank,
      bins,
      minValue,
      isActive,
    } = <CreateOfferInputs>req.body;

    const existingVendor = await Vendor.findById(user._id);
    if (existingVendor === null)
      return NotFound("No such vendor is Found!!", res);

    const offer = await OfferModel.create({
      title,
      description,
      offerType,
      offerAmount,
      pincode,
      promoCode,
      promoType,
      startValidity,
      endValidaity,
      bank,
      bins,
      isActive,
      minValue,
      vendors: [existingVendor],
    });

    return ReturnData({ offer }, res);
  } catch (err: any) {
    return ServerError(err.message, res);
  }
};

export const EditOffer = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const offerId = req.params.id;
    if (user === undefined) {
      return AuthenticateError("Not Authorized!!", res);
    }
    const {
      title,
      description,
      offerAmount,
      offerType,
      pincode,
      promoCode,
      promoType,
      startValidity,
      endValidaity,
      bank,
      bins,
      minValue,
      isActive,
    } = <CreateOfferInputs>req.body;

    const currentOffer = await OfferModel.findById(offerId);
    if (currentOffer === null) {
      return NotFound("No Such Offer is present", res);
    }

    const vendor = await Vendor.findById(user._id);
    if (vendor === null) {
      return NotFound("No Such vendor is found!!", res);
    }

    currentOffer.title = title;
    currentOffer.description = description;
    currentOffer.offerAmount = offerAmount;
    currentOffer.offerType = offerType;
    currentOffer.pincode = pincode;
    currentOffer.promoCode = promoCode;
    currentOffer.promoType = promoType;
    currentOffer.startValidity = startValidity;
    currentOffer.endValidaity = endValidaity;
    currentOffer.bank = bank;
    currentOffer.bins = bins;
    currentOffer.minValue = minValue;
    currentOffer.isActive = isActive;

    await currentOffer.save();

    return ReturnData({ currentOffer }, res);
  } catch (err: any) {
    return ServerError(err.message, res);
  }
};
