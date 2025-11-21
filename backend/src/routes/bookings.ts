import { Router } from "express"
import prisma from "../lib/prisma"
import { authenticate, requireAdmin } from "../middleware/auth"
import { bookingSchema } from "../utils/validation"

const router = Router()

// Check vehicle availability for date range
const checkAvailability = async (vehicleId: number, startAt: Date, endAt: Date, excludeBookingId?: number) => {
  const overlapping = await prisma.booking.findFirst({
    where: {
      vehicleId,
      status: { in: ["CONFIRMED"] },
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      OR: [
        { AND: [{ startAt: { lte: startAt } }, { endAt: { gte: startAt } }] },
        { AND: [{ startAt: { lte: endAt } }, { endAt: { gte: endAt } }] },
        { AND: [{ startAt: { gte: startAt } }, { endAt: { lte: endAt } }] },
      ],
    },
  })

  return !overlapping
}

// Calculate booking cost
const calculateCost = (startAt: Date, endAt: Date, dailyRate: number, type: string) => {
  const hours = (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60)

  if (type === "HOURLY") {
    return (dailyRate / 24) * hours
  } else if (type === "DAILY") {
    const days = Math.ceil(hours / 24)
    return dailyRate * days
  } else if (type === "WEEKLY") {
    const weeks = Math.ceil(hours / (24 * 7))
    return dailyRate * 7 * weeks
  }

  return 0
}

// Get bookings
router.get("/", authenticate, async (req, res, next) => {
  try {
    const where: any = {}

    // Regular users see only their bookings
    if (req.user?.role !== "ADMIN") {
      where.userId = req.user?.id
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        vehicle: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.json(bookings)
  } catch (error) {
    next(error)
  }
})

// Create booking
router.post("/", authenticate, async (req, res, next) => {
  try {
    const data = bookingSchema.parse(req.body)
    const startAt = new Date(data.startAt)
    const endAt = new Date(data.endAt)

    // Validate dates
    if (startAt >= endAt) {
      return res.status(400).json({ error: "End date must be after start date" })
    }

    if (startAt < new Date()) {
      return res.status(400).json({ error: "Start date must be in the future" })
    }

    // Check vehicle exists and is available
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    })

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" })
    }

    if (vehicle.status !== "AVAILABLE") {
      return res.status(400).json({ error: "Vehicle is not available" })
    }

    // Check for overlapping bookings
    const available = await checkAvailability(data.vehicleId, startAt, endAt)
    if (!available) {
      return res.status(409).json({ error: "Vehicle is already booked for this period" })
    }

    // Calculate cost
    const totalCost = calculateCost(startAt, endAt, vehicle.dailyRate, data.type)

    // Create booking in transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId: req.user!.id,
          vehicleId: data.vehicleId,
          startAt,
          endAt,
          purpose: data.purpose,
          type: data.type,
          totalCost,
        },
        include: {
          vehicle: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return newBooking
    })

    res.status(201).json(booking)
  } catch (error) {
    next(error)
  }
})

// Mark booking as hired (admin only)
router.put("/:id/mark-hired", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const booking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: Number.parseInt(req.params.id) },
        data: {
          hiredAt: new Date(),
        },
        include: {
          vehicle: true,
        },
      })

      // Update vehicle status
      await tx.vehicle.update({
        where: { id: updated.vehicleId },
        data: { status: "HIRED" },
      })

      return updated
    })

    res.json(booking)
  } catch (error) {
    next(error)
  }
})

// Mark booking as returned (admin only)
router.put("/:id/mark-returned", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const booking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: Number.parseInt(req.params.id) },
        data: {
          returnedAt: new Date(),
          status: "COMPLETED",
        },
        include: {
          vehicle: true,
        },
      })

      // Update vehicle status back to available
      await tx.vehicle.update({
        where: { id: updated.vehicleId },
        data: { status: "AVAILABLE" },
      })

      return updated
    })

    res.json(booking)
  } catch (error) {
    next(error)
  }
})

// Cancel booking
router.put("/:id/cancel", authenticate, async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number.parseInt(req.params.id) },
    })

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    // Only owner or admin can cancel
    if (booking.userId !== req.user?.id && req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized" })
    }

    if (booking.status !== "CONFIRMED") {
      return res.status(400).json({ error: "Booking cannot be cancelled" })
    }

    const updated = await prisma.booking.update({
      where: { id: Number.parseInt(req.params.id) },
      data: { status: "CANCELLED" },
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

export default router
