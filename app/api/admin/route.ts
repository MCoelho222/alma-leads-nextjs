import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const leads = await prisma.lead.findMany();
  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const id = Number(formData.get("id"));
  const newStatus = formData.get("status") as "PENDING" | "REACHED_OUT";

  await prisma.lead.update({
    where: { id },
    data: { status: newStatus as any },
  });

  // Get the referer URL to redirect back to the same page with filters
  const referer = req.headers.get("referer") || "/admin";
  return NextResponse.redirect(referer);
}
