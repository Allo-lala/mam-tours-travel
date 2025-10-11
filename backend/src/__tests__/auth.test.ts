import request from "supertest"
import app from "../index"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

describe("Auth Endpoints", () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({ where: { email: "test@example.com" } })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        })
        .expect(201)

      expect(response.body).toHaveProperty("user")
      expect(response.body).toHaveProperty("accessToken")
      expect(response.body).toHaveProperty("refreshToken")
      expect(response.body.user.email).toBe("test@example.com")
    })

    it("should reject duplicate email", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        })
        .expect(409)
    })
  })

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        })
        .expect(200)

      expect(response.body).toHaveProperty("accessToken")
      expect(response.body).toHaveProperty("refreshToken")
    })

    it("should reject invalid credentials", async () => {
      await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        })
        .expect(401)
    })
  })
})
