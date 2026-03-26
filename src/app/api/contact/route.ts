import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Contact from "@/models/contact.model";
import { sendAdminContactEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    if (process.env.EMAIL_USER) {
      sendAdminContactEmail(contact, process.env.EMAIL_USER).catch(err => console.error("Contact Email Error:", err));
    }

    return NextResponse.json(
      { success: true, message: "Message sent successfully", data: contact },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, contacts }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
