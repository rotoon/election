import { Router } from 'express'
import { z } from 'zod'
import { authenticate, authorize } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error.middleware.js'
import {
  candidateService,
  constituencyService,
  partyService,
  statsService,
} from '../services/index.js'

const router = Router()

// All routes require EC role
router.use(authenticate, authorize('ec', 'admin'))

// === Parties ===

// GET /api/ec/stats
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await statsService.getECStats()
    res.json({ success: true, ...stats })
  } catch (error) {
    next(error)
  }
})

// GET /api/ec/parties?page=1&limit=20
router.get('/parties', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20

    const result = await partyService.getAll({ page, limit })
    res.json({ success: true, ...result })
  } catch (error) {
    next(error)
  }
})

// POST /api/ec/parties
router.post('/parties', async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(1, 'กรุณาระบุชื่อพรรค'),
      logoUrl: z.string().optional(),
      policy: z.string().optional(),
      color: z.string().optional(),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors[0].message)
    }

    const party = await partyService.create(parsed.data)
    res.status(201).json({ success: true, data: party })
  } catch (error) {
    next(error)
  }
})

// PUT /api/ec/parties/:id
router.put('/parties/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const party = await partyService.update(id, req.body)
    res.json({ success: true, data: party })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/ec/parties/:id
router.delete('/parties/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    await partyService.delete(id)
    res.json({ success: true, message: 'ลบพรรคการเมืองสำเร็จ' })
  } catch (error) {
    next(error)
  }
})

// === Candidates ===

// GET /api/ec/candidates?page=1&limit=20&constituencyId=1&partyId=1
router.get('/candidates', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const constituencyId = req.query.constituencyId
      ? parseInt(req.query.constituencyId as string)
      : undefined
    const partyId = req.query.partyId
      ? parseInt(req.query.partyId as string)
      : undefined

    const result = await candidateService.getFiltered({
      page,
      limit,
      constituencyId,
      partyId,
    })

    res.json({ success: true, ...result })
  } catch (error) {
    next(error)
  }
})

// POST /api/ec/candidates
router.post('/candidates', async (req, res, next) => {
  try {
    const schema = z.object({
      firstName: z.string().min(1, 'กรุณาระบุชื่อ'),
      lastName: z.string().min(1, 'กรุณาระบุนามสกุล'),
      candidateNumber: z.number().min(1, 'หมายเลขต้องมากกว่า 0'),
      imageUrl: z.string().optional(),
      personalPolicy: z.string().optional(),
      partyId: z.number(),
      constituencyId: z.number(),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors[0].message)
    }

    const candidate = await candidateService.create(parsed.data)
    res.status(201).json({ success: true, data: candidate })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/ec/candidates/:id
router.delete('/candidates/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    await candidateService.delete(id)
    res.json({ success: true, message: 'ลบผู้สมัครสำเร็จ' })
  } catch (error) {
    next(error)
  }
})

// === Election Control ===

// GET /api/ec/control/constituencies?page=1&limit=50
router.get('/control/constituencies', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50

    const result = await constituencyService.getAll({ page, limit })
    res.json({ success: true, ...result })
  } catch (error) {
    next(error)
  }
})

// POST /api/ec/control/open-all
router.post('/control/open-all', async (req, res, next) => {
  try {
    await constituencyService.openAllPolls()
    res.json({ success: true, message: 'เปิดหีบเลือกตั้งทั้งหมดแล้ว' })
  } catch (error) {
    next(error)
  }
})

// POST /api/ec/control/close-all
router.post('/control/close-all', async (req, res, next) => {
  try {
    await constituencyService.closeAllPolls()
    res.json({ success: true, message: 'ปิดหีบเลือกตั้งทั้งหมดแล้ว' })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/ec/control/:id
router.patch('/control/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const { isPollOpen } = req.body

    const constituency = await constituencyService.updatePollStatus(
      id,
      isPollOpen,
    )
    res.json({ success: true, data: constituency })
  } catch (error) {
    next(error)
  }
})

export default router
