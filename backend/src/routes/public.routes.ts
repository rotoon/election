import { Router } from "express";
import {
  constituencyService,
  partyService,
  resultService,
} from "../services/index.js";

const router = Router();

// No authentication required for public routes

// GET /api/public/results?constituencyId=1
router.get("/results", async (req, res, next) => {
  try {
    const constituencyId = req.query.constituencyId
      ? parseInt(req.query.constituencyId as string)
      : undefined;

    if (constituencyId) {
      const result = await resultService.getResultsByConstituency(
        constituencyId
      );
      res.json({ success: true, data: result });
    } else {
      const results = await resultService.getAllResults();
      res.json({ success: true, data: results });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/public/parties?page=1&limit=20
router.get("/parties", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await partyService.getAll({ page, limit });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// GET /api/public/constituencies?page=1&limit=50
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

// GET /api/public/stats
router.get("/stats", async (req, res, next) => {
  try {
    const stats = await resultService.getDashboardStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
