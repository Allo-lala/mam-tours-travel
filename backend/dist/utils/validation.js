"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingSchema = exports.vehicleSchema = exports.loginSchema = exports.registerSchema = exports.normalizePlate = exports.validateUgandanPlate = void 0;
const zod_1 = require("zod");
// Uganda number plate validation patterns
const LEGACY_PLATE_PATTERN = /^[A-Z]{3}\s?\d{3}[A-Z]$/;
const DIGITAL_PLATE_PATTERN = /^UG\s?\d{1,2}\s?\d{4,5}$/;
const validateUgandanPlate = (plate) => {
    const normalized = plate.toUpperCase().replace(/\s+/g, " ").trim();
    return LEGACY_PLATE_PATTERN.test(normalized) || DIGITAL_PLATE_PATTERN.test(normalized);
};
exports.validateUgandanPlate = validateUgandanPlate;
const normalizePlate = (plate) => {
    return plate.toUpperCase().replace(/\s+/g, " ").trim();
};
exports.normalizePlate = normalizePlate;
// Validation schemas
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.vehicleSchema = zod_1.z.object({
    brand: zod_1.z.string().min(2),
    model: zod_1.z.string().optional(),
    plate: zod_1.z.string().refine(exports.validateUgandanPlate, {
        message: "Invalid Ugandan number plate format",
    }),
    dailyRate: zod_1.z.number().positive(),
    seats: zod_1.z.number().int().positive(),
});
exports.bookingSchema = zod_1.z.object({
    vehicleId: zod_1.z.number().int().positive(),
    startAt: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    endAt: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    purpose: zod_1.z.enum(["SELF_DRIVE", "VIP", "ESCORT", "FUNCTION", "AIRPORT_TRANSFER", "OTHER"]),
    type: zod_1.z.enum(["HOURLY", "DAILY", "WEEKLY"]),
});
