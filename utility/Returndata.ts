import { Response } from "express";

export const ReturnData = (data: any, res: Response) => {
  return res.status(200).json({
    error: false,
    ...data,
  });
};
