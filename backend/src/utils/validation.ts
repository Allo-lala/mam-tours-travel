import { z } from "zod"

// Uganda number plate validation patterns
const LEGACY_PLATE_PATTERN = /^[A-Z]{3}\s?\d{3}[A-Z]$/
const DIGITAL_PLATE_PATTERN = /^UG\s?\d{1,2}\s?\d{4,5}$/

export const validateUgandanPlate = (plate: string): boolean => {
  const normalized = plate.toUpperCase().replace(/\s+/g, " ").trim()
  return LEGACY_PLATE_PATTERN.test(normalized) || DIGITAL_PLATE_PATTERN.test(normalized)
}

export const normalizePlate = (plate: string): string => {
  return plate.toUpperCase().replace(/\s+/g, " ").trim()
}

// Validation schemas
export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const vehicleSchema = z.object({
  brand: z.string().min(2),
  model: z.string().optional(),
  plate: z.string().refine(validateUgandanPlate, {
    message: "Invalid Ugandan number plate format",
  }),
  dailyRate: z.number().positive(),
  seats: z.number().int().positive(),
})

export const bookingSchema = z.object({
  vehicleId: z.number().int().positive(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  purpose: z.enum(["SELF_DRIVE", "VIP", "ESCORT", "FUNCTION", "AIRPORT_TRANSFER", "OTHER"]),
  type: z.enum(["HOURLY", "DAILY", "WEEKLY"]),
})
