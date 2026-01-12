import { Router } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { profileRepository } from "../repositories/index.js";
import {
  candidateService,
  constituencyService,
  voteService,
} from "../services/index.js";

const router = Router();

// All routes require voter role
router.use(authenticate, authorize("voter", "admin", "ec"));

// GET /api/voter/constituency - Get user's constituency info
router.get("/constituency", async (req, res, next) => {
  try {
    const user = await profileRepository.findById(req.user!.userId);
    if (!user?.constituencyId) {
      throw new AppError(400, "คุณยังไม่ได้ลงทะเบียนเขตเลือกตั้ง");
    }

    const constituency = await constituencyService.getById(user.constituencyId);
    res.json({ success: true, data: constituency });
  } catch (error) {
    next(error);
  }
});

// GET /api/voter/candidates - Get candidates in user's constituency
router.get("/candidates", async (req, res, next) => {
  try {
    const user = await profileRepository.findById(req.user!.userId);
    if (!user?.constituencyId) {
      throw new AppError(400, "คุณยังไม่ได้ลงทะเบียนเขตเลือกตั้ง");
    }

    const candidates = await candidateService.getByConstituency(
      user.constituencyId
    );
    res.json({ success: true, data: candidates });
  } catch (error) {
    next(error);
  }
});

// GET /api/voter/my-vote - Get user's current vote
router.get("/my-vote", async (req, res, next) => {
  try {
    const user = await profileRepository.findById(req.user!.userId);
    if (!user?.constituencyId) {
      throw new AppError(400, "คุณยังไม่ได้ลงทะเบียนเขตเลือกตั้ง");
    }

    const vote = await voteService.getMyVote(user.id, user.constituencyId);
    res.json({ success: true, data: vote });
  } catch (error) {
    next(error);
  }
});

// POST /api/voter/vote - Cast a vote
router.post("/vote", async (req, res, next) => {
  try {
    const schema = z.object({
      candidateId: z.number(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "กรุณาเลือกผู้สมัคร");
    }

    const user = await profileRepository.findById(req.user!.userId);
    if (!user?.constituencyId) {
      throw new AppError(400, "คุณยังไม่ได้ลงทะเบียนเขตเลือกตั้ง");
    }

    const vote = await voteService.castVote(
      user.id,
      parsed.data.candidateId,
      user.constituencyId
    );

    res
      .status(201)
      .json({ success: true, data: vote, message: "ลงคะแนนสำเร็จ" });
  } catch (error) {
    next(error);
  }
});

// PUT /api/voter/vote - Change vote
router.put("/vote", async (req, res, next) => {
  try {
    const schema = z.object({
      candidateId: z.number(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "กรุณาเลือกผู้สมัคร");
    }

    const user = await profileRepository.findById(req.user!.userId);
    if (!user?.constituencyId) {
      throw new AppError(400, "คุณยังไม่ได้ลงทะเบียนเขตเลือกตั้ง");
    }

    const vote = await voteService.changeVote(
      user.id,
      parsed.data.candidateId,
      user.constituencyId
    );

    res.json({ success: true, data: vote, message: "เปลี่ยนคะแนนสำเร็จ" });
  } catch (error) {
    next(error);
  }
});

export default router;
