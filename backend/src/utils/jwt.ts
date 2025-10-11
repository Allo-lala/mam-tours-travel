import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

export const generateAccessToken = (payload: { id: number; email: string; role: string }) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" })
}

export const generateRefreshToken = (payload: { id: number; email: string; role: string }) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" })
}

export const hashToken = async (token: string): Promise<string> => {
  return bcrypt.hash(token, 10)
}

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
    id: number
    email: string
    role: string
  }
}
