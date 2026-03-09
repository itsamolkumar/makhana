import { apiSuccess } from "@/utils/apiResponse";

export async function POST() {

  const response = apiSuccess(null, "Logout successful");

  response.cookies.set("accessToken", "", {

    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0

  });

  response.cookies.set("refreshToken", "", {

    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0

  });

  return response;

}