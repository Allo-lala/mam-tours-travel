"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
describe("Booking Endpoints", () => {
    let accessToken;
    let vehicleId;
    beforeAll(async () => {
        // Login to get token
        const loginResponse = await (0, supertest_1.default)(index_1.default).post("/api/auth/login").send({
            email: "user@example.com",
            password: "user123",
        });
        accessToken = loginResponse.body.accessToken;
        // Get a vehicle
        const vehicle = await prisma.vehicle.findFirst();
        vehicleId = vehicle.id;
    });
    afterAll(async () => {
        await prisma.$disconnect();
    });
    describe("POST /api/bookings", () => {
        it("should create a booking with valid data", async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dayAfter = new Date();
            dayAfter.setDate(dayAfter.getDate() + 2);
            const response = await (0, supertest_1.default)(index_1.default)
                .post("/api/bookings")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                vehicleId,
                startAt: tomorrow.toISOString(),
                endAt: dayAfter.toISOString(),
                purpose: "SELF_DRIVE",
                type: "DAILY",
            })
                .expect(201);
            expect(response.body).toHaveProperty("id");
            expect(response.body.vehicleId).toBe(vehicleId);
        });
        it("should reject booking without authentication", async () => {
            await (0, supertest_1.default)(index_1.default)
                .post("/api/bookings")
                .send({
                vehicleId,
                startAt: new Date().toISOString(),
                endAt: new Date().toISOString(),
                purpose: "SELF_DRIVE",
                type: "DAILY",
            })
                .expect(401);
        });
    });
});
