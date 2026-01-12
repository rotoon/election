import { Router } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import {
  constituencyService,
  statsService,
  userService,
} from "../services/index.js";

const router = Router();

// All routes require admin role
router.use(authenticate, authorize("admin"));

// === Constituencies ===

// GET /api/admin/stats
router.get("/stats", async (req, res, next) => {
  try {
    const stats = await statsService.getAdminStats();
    res.json({ success: true, ...stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/constituencies?page=1&limit=20
router.get("/constituencies", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await constituencyService.getAll({ page, limit });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/constituencies
router.post("/constituencies", async (req, res, next) => {
  try {
    const schema = z.object({
      province: z.string().min(1, "กรุณาระบุจังหวัด"),
      zoneNumber: z.number().min(1, "หมายเลขเขตต้องมากกว่า 0"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors[0].message);
    }

    const constituency = await constituencyService.create(parsed.data);
    res.status(201).json({ success: true, data: constituency });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/constituencies/:id
router.delete("/constituencies/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await constituencyService.delete(id);
    res.json({ success: true, message: "ลบเขตเลือกตั้งสำเร็จ" });
  } catch (error) {
    next(error);
  }
});

// === Users ===

// GET /api/admin/users?page=1&limit=20
router.get("/users", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await userService.getAll({ page, limit });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/users/:id/role
router.patch("/users/:id/role", async (req, res, next) => {
  try {
    const schema = z.object({
      role: z.enum(["admin", "ec", "voter"]),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "Role ไม่ถูกต้อง");
    }

    const user = await userService.updateRole(req.params.id, parsed.data.role);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

export default router;
