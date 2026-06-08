import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { content } = await req.json();
  const note = await prisma.note.create({ data: { caseId: id, content } });
  return NextResponse.json(note, { status: 201 });
}
