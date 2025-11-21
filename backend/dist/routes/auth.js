"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const validation_1 = require("../utils/validation");
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Register
router.post("/register", async (req, res, next) => {
    try {
        const data = validation_1.registerSchema.parse(req.body);
        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            return res.status(409).json({ error: "Email already registered" });
        }
        // Hash password
        const passwordHash = await bcrypt_1.default.hash(data.password, 10);
        // Create user
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        // Generate tokens
        const accessToken = (0, jwt_1.generateAccessToken)({ id: user.id, email: user.email, role: user.role });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id, email: user.email, role: user.role });
        // Store refresh token
        const tokenHash = await (0, jwt_1.hashToken)(refreshToken);
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });
        res.status(201).json({ user, accessToken, refreshToken });
    }
    catch (error) {
        next(error);
    }
});
// Login
router.post("/login", async (req, res, next) => {
    try {
        const data = validation_1.loginSchema.parse(req.body);
        // Find user
        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Verify password
        const valid = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Generate tokens
        const accessToken = (0, jwt_1.generateAccessToken)({ id: user.id, email: user.email, role: user.role });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id, email: user.email, role: user.role });
        // Store refresh token
        const tokenHash = await (0, jwt_1.hashToken)(refreshToken);
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        next(error);
    }
});
// Refresh token
router.post("/refresh", async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token required" });
        }
        // Verify token
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        // Check if token exists in database
        const tokenHash = await (0, jwt_1.hashToken)(refreshToken);
        const storedToken = await prisma.refreshToken.findFirst({
            where: {
                userId: decoded.id,
                expiresAt: { gte: new Date() },
            },
        });
        if (!storedToken) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }
        // Generate new access token
        const accessToken = (0, jwt_1.generateAccessToken)({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        });
        res.json({ accessToken });
    }
    catch (error) {
        next(error);
    }
});
// Logout
router.post("/logout", async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token required" });
        }
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const tokenHash = await (0, jwt_1.hashToken)(refreshToken);
        // Delete refresh token
        await prisma.refreshToken.deleteMany({
            where: { userId: decoded.id },
        });
        res.json({ message: "Logged out successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
