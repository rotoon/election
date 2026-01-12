import { NextFunction, Request, Response } from "express";
import { JwtPayload, verifyToken } from "../utils/jwt.js";
import { AppError } from "./error.middleware.js";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(401, "กรุณาเข้าสู่ระบบ");
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    throw new AppError(401, "Token ไม่ถูกต้องหรือหมดอายุ");
  }

  req.user = payload;
  next();
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "กรุณาเข้าสู่ระบบ");
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้");
    }

    next();
  };
}
