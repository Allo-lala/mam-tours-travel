import { Router } from "express"
import prisma from "../lib/prisma"
import { authenticate, requireAdmin } from "../middleware/auth"
import { vehicleSchema, normalizePlate } from "../utils/validation"

const router = Router()

// Get all vehicles (public)
router.get("/", async (req, res, next) => {
  try {
    const { brand, status, available } = req.query

    const where: any = {}
    if (brand) where.brand = { contains: brand as string, mode: "insensitive" }
    if (status) where.status = status
    if (available === "true") where.status = "AVAILABLE"

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    res.json(vehicles)
  } catch (error) {
    next(error)
  }
})

// Get vehicle by ID
router.get("/:id", async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number.parseInt(req.params.id) },
      include: {
        bookings: {
          where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
          orderBy: { startAt: "desc" },
          take: 5,
        },
      },
    })

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" })
    }

    res.json(vehicle)
  } catch (error) {
    next(error)
  }
})

// Create vehicle (admin only)
router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = vehicleSchema.parse(req.body)

    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        plate: normalizePlate(data.plate),
      },
    })

    res.status(201).json(vehicle)
  } catch (error) {
    next(error)
  }
})

// Update vehicle (admin only)
router.put("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { dailyRate, status } = req.body

    const vehicle = await prisma.vehicle.update({
      where: { id: Number.parseInt(req.params.id) },
      data: {
        ...(dailyRate && { dailyRate: Number.parseFloat(dailyRate) }),
        ...(status && { status }),
      },
    })

    res.json(vehicle)
  } catch (error) {
    next(error)
  }
})

// Delete vehicle (admin only)
router.delete("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    await prisma.vehicle.delete({
      where: { id: Number.parseInt(req.params.id) },
    })

    res.json({ message: "Vehicle deleted successfully" })
  } catch (error) {
    next(error)
  }
})

export default router
