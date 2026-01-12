import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { authService } from "../services/index.js";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  nationalId: z.string().length(13, "เลขบัตรประชาชนต้องมี 13 หลัก"),
  fullName: z.string().min(1, "กรุณาระบุชื่อ-นามสกุล"),
  address: z.string().min(1, "กรุณาระบุที่อยู่"),
  constituencyId: z.number().optional(),
});

const loginSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณาระบุรหัสผ่าน"),
});

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors[0].message);
    }

    const result = await authService.register(parsed.data);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors[0].message);
    }

    const result = await authService.login(
      parsed.data.email,
      parsed.data.password
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout (client-side only, just return success)
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "ออกจากระบบสำเร็จ" });
});

export default router;
