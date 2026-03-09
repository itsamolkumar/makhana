import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

export interface JwtPayload {

  userId: string;
  email: string;
  role: string;
  isVerified: boolean;

}

export function generateAccessToken(payload: JwtPayload) {

  const options: SignOptions = {

    expiresIn: ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"]

  };

  return jwt.sign(payload, JWT_SECRET, options);

}

export function generateRefreshToken(payload: JwtPayload) {

  const options: SignOptions = {

    expiresIn: REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"]

  };

  return jwt.sign(payload, JWT_SECRET, options);

}

export function verifyToken(token: string) {

  try {

    return jwt.verify(token, JWT_SECRET);

  } catch {

    return null;

  }

}