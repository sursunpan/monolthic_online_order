import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import {
  CartItem,
  CreateCustomerInputs,
  EditCustomerProfileInput,
  OrderInputs,
  UserLoginInputs,
} from "../dto/Customer.dto";
import { validate } from "class-validator";
import {
  GenerateOtp,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  onRequestOTP,
  ValidatePassword,
} from "../utility";
import { Customer, Food, OfferModel, Transaction } from "../models";
import {
  AuthenticateError,
  NotFound,
  ReturnData,
  ServerError,
} from "../utility/statusCode";
import { Order } from "../models/Order";

export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerInputs = plainToClass(CreateCustomerInputs, req.body);
    const inputErrors = await validate(customerInputs, {
      validationError: { target: true },
    });

    if (inputErrors.length > 0) {
      return res.status(400).json({
        error: true,
        message: inputErrors,
      });
    }

    const { email, phone, password } = customerInputs;

    const existingCustomer = await Customer.findOne({
      email,
    });
    if (existingCustomer !== null) {
      return res.status(400).json({
        error: true,
        message: "Customer already exist with us :-)",
      });
    }
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const { otp, expiry } = GenerateOtp();

    const customer = await Customer.create({
      email,
      password: userPassword,
      phone,
      salt,
      otp,
      otp_expiry: expiry,
      firstName: "",
      lastName: "",
      address: "",
      verified: false,
      lat: 0,
      lng: 0,
    });

    await onRequestOTP(otp, phone);

    const signature = await GenerateSignature({
      id: customer.id,
      _id: customer.id,
      email: customer.email,
      verified: customer.verified,
    });

    ReturnData({ token: signature }, res);
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loginInputs = plainToClass(UserLoginInputs, req.body);
    const inputErrors = await validate(loginInputs, {
      validationError: { target: true },
    });

    if (inputErrors.length > 0) {
      return res.status(400).json({
        error: true,
        message: inputErrors,
      });
    }

    const { email, password } = loginInputs;
    const customer = await Customer.findOne({ email });
    if (customer === null) {
      return res.status(400).json({
        error: true,
        message: "No Such Customer :-(",
      });
    }

    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );
    if (validation === false) {
      return res.status(400).json({
        error: true,
        message: "Password not matched :-(",
      });
    }

    const signature = await GenerateSignature({
      id: customer.id,
      _id: customer.id,
      email: customer.email,
      verified: customer.verified,
    });

    ReturnData({ token: signature }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { otp } = req.body;
    const customer = req.user;

    if (customer === undefined) {
      return res.status(400).json({
        error: true,
        message: "customer not authnicate",
      });
    }

    const profile = await Customer.findById(customer._id);
    if (profile === null) {
      return res.status(400).json({
        error: true,
        message: "No such customer with us :-(",
      });
    }

    if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
      console.log("suraj");
      profile.verified = true;
    }
    await profile.save();
    const signature = await GenerateSignature({
      id: profile.id,
      _id: profile.id,
      email: profile.email,
      verified: profile.verified,
    });

    ReturnData({ token: signature }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;

    if (customer === undefined) {
      return res.status(400).json({
        error: true,
        message: "customer not authnicate",
      });
    }

    const profile = await Customer.findById(customer._id);
    if (profile === null) {
      return res.status(400).json({
        error: true,
        message: "No such customer with us :-(",
      });
    }

    const { otp, expiry } = GenerateOtp();

    profile.otp = otp;
    profile.otp_expiry = expiry;

    await profile.save();
    await onRequestOTP(otp, profile.phone);

    ReturnData({ message: "OTP Sent successfully" }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;
    if (customer === undefined) {
      return res.status(400).json({
        error: true,
        message: "customer not authnicate",
      });
    }

    const profile = await Customer.findById(customer._id);
    if (profile === null) {
      return res.status(400).json({
        error: true,
        message: "No such customer with us :-(",
      });
    }

    ReturnData({ profile }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;
    if (customer === undefined) {
      return res.status(400).json({
        error: true,
        message: "customer not authnicate",
      });
    }
    const customerInputs = plainToClass(EditCustomerProfileInput, req.body);

    const validationError = await validate(customerInputs, {
      validationError: { target: true },
    });

    if (validationError.length > 0) {
      return res.status(400).json({
        error: true,
        message: validationError,
      });
    }

    const { firstName, lastName, address } = customerInputs;

    const profile = await Customer.findById(customer._id);
    if (profile === null) {
      return res.status(400).json({
        error: true,
        message: "No such customer with us :-(",
      });
    }

    profile.firstName = firstName;
    profile.lastName = lastName;
    profile.address = address;

    await profile.save();
    ReturnData({ profile }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const AddToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;
    if (customer === undefined)
      return AuthenticateError("customer not authnicate", res);

    const profile = await Customer.findById(customer._id).populate("cart.food");
    if (profile === null) return NotFound("No Such customer is found!!", res);

    let cartItems = Array();
    const { _id, unit } = <CartItem>req.body;

    const food = await Food.findById(_id);
    if (food === null) return NotFound("No Such Food Items is found!!", res);

    cartItems = profile.cart;
    if (cartItems.length > 0) {
      let existingFoodItem = cartItems.filter(
        (item) => item.food._id.toString() === _id
      );
      if (existingFoodItem.length > 0) {
        const index = cartItems.indexOf(existingFoodItem[0]);
        if (unit > 0) {
          cartItems[index] = { food, unit };
        } else {
          cartItems.splice(index, 1);
        }
      } else {
        cartItems.push({ food, unit });
      }
    } else {
      cartItems.push({
        food,
        unit,
      });
    }

    if (cartItems) profile.cart = cartItems as any;
    await profile.save();
    return ReturnData({ cartResult: profile.cart }, res);
  } catch (err: any) {
    return ServerError(err.message, res);
  }
};

export const GetCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;
    if (customer === undefined)
      return AuthenticateError("customer not authnicate", res);

    const profile = await Customer.findById(customer._id).populate("cart.food");
    if (profile === null) return NotFound("No Such customer is found!!", res);

    return ReturnData({ profile }, res);
  } catch (err: any) {
    return ServerError(err.message, res);
  }
};

export const DeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;
    if (customer === undefined)
      return AuthenticateError("customer not authnicate", res);

    const profile = await Customer.findById(customer._id).populate("cart.food");
    if (profile === null) return NotFound("No Such customer is found!!", res);

    profile.cart = [] as any;
    await profile.save();

    ReturnData({ profile }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;
    if (customer === undefined) {
      return res.status(400).json({
        error: true,
        message: "customer not authnicate",
      });
    }

    const { txnId, amount, items } = <OrderInputs>req.body;

    const validateTranscation = await Transaction.findById(txnId);
    if (validateTranscation === null) {
      return NotFound("No Such tranction is happen!!", res);
    }

    if (validateTranscation.status.toLowerCase() === "failed") {
      return NotFound("Transction is failed", res);
    }

    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;
    const profile = await Customer.findById(customer._id);
    if (profile === null) return NotFound("No such profile", res);
    let cartItems = Array();
    let netAmount = 0.0;
    let vendorId;
    const foods = await Food.find()
      .where("_id")
      .in(items.map((item) => item._id))
      .exec();
    foods.map((food) => {
      items.map(({ _id, unit }) => {
        if (food._id == _id) {
          vendorId = food.vendorId;
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        }
      });
    });

    if (cartItems) {
      const currentOrder = await Order.create({
        orderId,
        vendorId,
        items: cartItems,
        totalAmount: netAmount,
        paidAmount: amount,
        orderDate: new Date(),
        orderStauts: "Waiting",
        remarks: "",
        deliveryId: "",
        readyTime: 45,
      });
      if (currentOrder) {
        profile?.orders.push(currentOrder);
      }
    }
    profile.cart = [] as any;
    await profile.save();

    vendorId ? (validateTranscation.vendorId = vendorId) : "";
    validateTranscation.orderId = orderId;
    validateTranscation.status = "CONFIRMED";

    await validateTranscation.save();

    ReturnData({ profile, validateTranscation }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const GetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;
    if (customer === undefined) {
      return res.status(400).json({
        error: true,
        message: "customer not authnicate",
      });
    }
    const profile = await Customer.findById(customer._id).populate("orders");
    ReturnData({ profile }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const GetOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;
    if (customer === undefined) {
      return res.status(400).json({
        error: true,
        message: "customer not authnicate",
      });
    }
    const order = await Order.findById(req.params.id).populate("items.food");
    ReturnData({ order }, res);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const VerifyOffer = async (req: Request, res: Response) => {
  try {
    const offerId = req.params.id;
    const customer = req.user;

    if (customer === undefined) {
      return AuthenticateError("User is Not Authorize", res);
    }

    const appliedOffer = await OfferModel.findOne({
      _id: offerId,
      isActive: true,
    });
    if (appliedOffer === null) {
      return NotFound("No Such offer is Present!!", res);
    }

    if (appliedOffer.promoType === "USER") {
      // do some stuff
    }

    return ReturnData({ appliedOffer }, res);
  } catch (err: any) {
    return ServerError(err.message, res);
  }
};

export const CreatePayment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (user === undefined) {
      return AuthenticateError("User is not authorize", res);
    }
    const { amount, paymentMode, offerId } = req.body;
    let payableAmount = Number(amount);

    if (offerId) {
      const appliedOffer = await OfferModel.findOne({
        _id: offerId,
        isActive: true,
      });
      if (appliedOffer === null) {
        return NotFound("No such offer is present!!", res);
      }
      payableAmount = payableAmount - appliedOffer.offerAmount;
    }

    // perform payment gate way
    //create record on transaction
    const transaction = await Transaction.create({
      customer: user._id,
      vendorId: "",
      orderId: "",
      orderValue: payableAmount,
      offerUsed: offerId || "NA",
      status: "OPEN", // in case of cod it is open otherwise failed and success
      paymentMode: paymentMode,
      paymentResponse: "Payment is Cash on Delivery",
    });
    // return transaction id

    return ReturnData({ transaction }, res);
  } catch (err: any) {
    return ServerError(err.message, res);
  }
};
