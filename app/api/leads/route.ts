import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("resume") as File | null;
    const buffer = file ? Buffer.from(await file.arrayBuffer()) : null;

    // Extract categories with proper type conversion
    const categoriesData = formData.getAll("categories");
    const categories: string[] = categoriesData.map((item) => String(item));

    const leadData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      country: formData.get("country") as string,
      website: formData.get("website") as string,
      reason: formData.get("reason") as string,
      categories: categories,
      resume: buffer,
    };

    const lead = await prisma.lead.create({
      data: leadData as any,
    });

    return NextResponse.json({ ok: true, lead: lead.id });
  } catch (error) {
    console.error("Detailed error creating lead:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorName = error instanceof Error ? error.name : "Unknown";
    const errorStack = error instanceof Error ? error.stack : "No stack trace";

    console.error("Error name:", errorName);
    console.error("Error message:", errorMessage);
    console.error("Error stack:", errorStack);

    return NextResponse.json(
      {
        error: "Failed to create lead",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
