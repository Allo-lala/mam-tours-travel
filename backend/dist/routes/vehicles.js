"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all vehicles (public)
router.get("/", async (req, res, next) => {
    try {
        const { brand, status, available } = req.query;
        const where = {};
        if (brand)
            where.brand = { contains: brand, mode: "insensitive" };
        if (status)
            where.status = status;
        if (available === "true")
            where.status = "AVAILABLE";
        const vehicles = await prisma.vehicle.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
        res.json(vehicles);
    }
    catch (error) {
        next(error);
    }
});
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
        });
        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }
        res.json(vehicle);
    }
    catch (error) {
        next(error);
    }
});
// Create vehicle (admin only)
router.post("/", auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const data = validation_1.vehicleSchema.parse(req.body);
        const vehicle = await prisma.vehicle.create({
            data: {
                ...data,
                plate: (0, validation_1.normalizePlate)(data.plate),
            },
        });
        res.status(201).json(vehicle);
    }
    catch (error) {
        next(error);
    }
});
// Update vehicle (admin only)
router.put("/:id", auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const { dailyRate, status } = req.body;
        const vehicle = await prisma.vehicle.update({
            where: { id: Number.parseInt(req.params.id) },
            data: {
                ...(dailyRate && { dailyRate: Number.parseFloat(dailyRate) }),
                ...(status && { status }),
            },
        });
        res.json(vehicle);
    }
    catch (error) {
        next(error);
    }
});
// Delete vehicle (admin only)
router.delete("/:id", auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        await prisma.vehicle.delete({
            where: { id: Number.parseInt(req.params.id) },
        });
        res.json({ message: "Vehicle deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
