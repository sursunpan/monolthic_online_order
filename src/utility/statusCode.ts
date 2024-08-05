import { Response } from "express";

// 200 status ok.....
export const ReturnData = (data: any, res: Response) => {
  return res.status(200).json({
    error: false,
    ...data,
  });
};

// 400 status not found...

export const NotFound = (message: any, res: Response) => {
  return res.status(400).json({
    error: true,
    message: message,
  });
};

// 500 server error....

export const ServerError = (message: any, res: Response) => {
  return res.status(500).json({
    error: true,
    message: message,
  });
};

// Authenticate Error
export const AuthenticateError = (message: any, res: Response) => {
  return res.status(401).json({
    error: true,
    message: message,
  });
};
