import { NextRequest } from "next/server";

import { authMiddleware } from "./auth.middleware";

import { apiError } from "@/utils/apiResponse";

export async function adminMiddleware(req: NextRequest) {

  const user: any = await authMiddleware(req);

  if (!user) throw new Error("Unauthorized");

  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }

  return user;

}