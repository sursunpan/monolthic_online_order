import { Request, Response, NextFunction } from "express";
import { ValidateSignature } from "../utility";

export const Authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validate = await ValidateSignature(req);
    if (validate) {
      return next();
    }
  } catch (err) {
    return err;
  }
};
