import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function handleError(error: any) {

  // Zod validation error
  if (error instanceof ZodError) {

    return NextResponse.json(
      {
        success: false,
        message: error.issues[0].message
      },
      {
        status: 400
      }
    );

  }

  // Mongo duplicate key error
  if (error.code === 11000) {

    const field = Object.keys(error.keyValue)[0];

    return NextResponse.json(
      {
        success: false,
        message: `${field} already exists`
      },
      {
        status: 400
      }
    );

  }

  // Authentication errors
  if (error.message === "Unauthorized" || error.message === "Invalid token" || error.message === "Authentication failed") {
    return NextResponse.json(
      {
        success: false,
        message: error.message
      },
      {
        status: 401
      }
    );
  }

  // Default server error
  return NextResponse.json(
    {
      success: false,
      message: error.message || "Internal Server Error"
    },
    {
      status: 500
    }
  );

}