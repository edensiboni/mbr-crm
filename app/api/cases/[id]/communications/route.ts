import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { type, direction, content } = await req.json();
  const comm = await prisma.communication.create({ data: { caseId: id, type, direction: direction || "outbound", content } });
  return NextResponse.json(comm, { status: 201 });
}
