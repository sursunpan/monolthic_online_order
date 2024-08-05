import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { VendorPayload } from "../dto";
import { AuthPayload } from "../dto/auth.dto";
import { APP_SECRET } from "../config";

export const GenerateSalt = async (): Promise<string> => {
  try {
    return await bcrypt.genSalt();
  } catch (err: any) {
    console.log("====================error in geneSalt==============", err);
    return err;
  }
};

export const GeneratePassword = async (
  password: string,
  salt: string
): Promise<string> => {
  try {
    return await bcrypt.hash(password, salt);
  } catch (err: any) {
    console.log("====================error in geneSalt==============", err);
    return err;
  }
};

export const ValidatePassword = async (
  enterPassword: string,
  savedPassword: string,
  salt: string
) => {
  try {
    return (await GeneratePassword(enterPassword, salt)) === savedPassword;
  } catch (err: any) {
    console.log("====================error in geneSalt==============", err);
    return err;
  }
};

export const GenerateSignature = async (payload: AuthPayload) => {
  try {
    return jwt.sign(payload, APP_SECRET, { expiresIn: "1d" });
  } catch (err: any) {
    console.log("====================error in geneSalt==============", err);
    return err;
  }
};

export const ValidateSignature = async (req: Request) => {
  try {
    const signature = req.get("Authorization");
    if (signature === undefined) {
      throw new Error("User not authorize");
    }
    const payload = jwt.verify(
      signature.split(" ")[1],
      APP_SECRET
    ) as AuthPayload;
    req.user = payload;
    return true;
  } catch (err: any) {
    console.log("====================error in geneSalt==============", err);
    return err;
  }
};
