import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  constructor(public statusCode: number, public message: string) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({
      success: false,
      message: "Database error",
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
