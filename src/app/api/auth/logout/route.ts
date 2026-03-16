import { apiSuccess } from "@/utils/apiResponse";

export async function POST() {

  const response = apiSuccess(null, "Logout successful");

  const secureCookie = process.env.USE_SECURE_COOKIES === "true";

  response.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;

}