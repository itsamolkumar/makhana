export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Customization from "@/models/customization.model";

export async function GET() {
  try {
    await connectDB();
    let config = await Customization.findOne();

    if (!config) {
      // Create defaults
      config = await Customization.create({
        heroSlides: [
          { type: "video", src: "/intro.mp4" },
          { type: "image", src: "/Hero2.jpeg" },
          { type: "image", src: "/Hero3.png" },
          { type: "image", src: "/Hero4.png" },
          { type: "image", src: "/Hero5.jpeg" },
        ],
        rootImage: "/Hero2.jpeg",
        socialLinks: {
          instagram: "",
          facebook: "",
          twitter: "",
        },
      });
    }

    return NextResponse.json({ success: true, data: config }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching customization:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    // Basic auth check can be middleware-based, relying on existing app setup.
    await connectDB();
    const body = await req.json();

    const config = await Customization.findOne();
    if (!config) {
      await Customization.create(body);
    } else {
      await Customization.updateOne({}, body);
    }

    const updatedConfig = await Customization.findOne();

    return NextResponse.json({ success: true, data: updatedConfig }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating customization:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
