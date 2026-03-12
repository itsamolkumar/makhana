import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function authMiddleware(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("accessToken")?.value;

    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    const decoded = verifyToken(accessToken);

    if (!decoded) {
      throw new Error("Invalid token");
    }

    return decoded;
  } catch (error: any) {
    throw new Error(error.message || "Authentication failed");
  }
}