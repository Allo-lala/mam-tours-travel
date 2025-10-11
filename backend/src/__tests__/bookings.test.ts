import request from "supertest"
import app from "../index"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

describe("Booking Endpoints", () => {
  let accessToken: string
  let vehicleId: number

  beforeAll(async () => {
    // Login to get token
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "user@example.com",
      password: "user123",
    })

    accessToken = loginResponse.body.accessToken

    // Get a vehicle
    const vehicle = await prisma.vehicle.findFirst()
    vehicleId = vehicle!.id
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe("POST /api/bookings", () => {
    it("should create a booking with valid data", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dayAfter = new Date()
      dayAfter.setDate(dayAfter.getDate() + 2)

      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          vehicleId,
          startAt: tomorrow.toISOString(),
          endAt: dayAfter.toISOString(),
          purpose: "SELF_DRIVE",
          type: "DAILY",
        })
        .expect(201)

      expect(response.body).toHaveProperty("id")
      expect(response.body.vehicleId).toBe(vehicleId)
    })

    it("should reject booking without authentication", async () => {
      await request(app)
        .post("/api/bookings")
        .send({
          vehicleId,
          startAt: new Date().toISOString(),
          endAt: new Date().toISOString(),
          purpose: "SELF_DRIVE",
          type: "DAILY",
        })
        .expect(401)
    })
  })
})
