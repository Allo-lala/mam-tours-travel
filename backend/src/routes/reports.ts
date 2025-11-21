import { Router } from "express"
import prisma from "../lib/prisma"
import { authenticate, requireAdmin } from "../middleware/auth"

const router = Router()

// Vehicle usage report (admin only)
router.get("/usage", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        bookings: {
          where: {
            status: { in: ["CONFIRMED", "COMPLETED"] },
          },
          orderBy: { startAt: "desc" },
        },
      },
    })

    const report = vehicles.map((vehicle) => {
      const completedBookings = vehicle.bookings.filter((b) => b.status === "COMPLETED")
      const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0)

      return {
        vehicle: {
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          plate: vehicle.plate,
          status: vehicle.status,
        },
        stats: {
          totalBookings: vehicle.bookings.length,
          completedBookings: completedBookings.length,
          activeBookings: vehicle.bookings.filter((b) => b.status === "CONFIRMED").length,
          totalRevenue,
        },
        recentBookings: vehicle.bookings.slice(0, 5).map((b) => ({
          id: b.id,
          startAt: b.startAt,
          endAt: b.endAt,
          hiredAt: b.hiredAt,
          returnedAt: b.returnedAt,
          status: b.status,
          totalCost: b.totalCost,
        })),
      }
    })

    res.json(report)
  } catch (error) {
    next(error)
  }
})

export default router
