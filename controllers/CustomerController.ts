import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import {
  CreateCustomerInputs,
  EditCustomerProfileInput,
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
import { Customer } from "../models";
import { ReturnData } from "../utility/Returndata";

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
