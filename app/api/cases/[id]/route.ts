import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await prisma.case.findUnique({
    where: { id },
    include: {
      customer: true,
      notes: { orderBy: { createdAt: "desc" } },
      communications: { orderBy: { createdAt: "desc" } },
      images: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(c);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  // Guard: completing a case requires at least one completion image
  if (body.status === "completed") {
    const completionImages = await prisma.caseImage.count({
      where: { caseId: id, type: "completion" },
    });
    if (completionImages === 0) {
      return NextResponse.json(
        { error: "Please upload at least one completion photo before closing this case." },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.case.update({
    where: { id },
    data: {
      ...body,
      completedAt: body.status === "completed" ? new Date() : undefined,
      estimatedCost: body.estimatedCost !== undefined ? parseFloat(body.estimatedCost) || null : undefined,
      finalCost: body.finalCost !== undefined ? parseFloat(body.finalCost) || null : undefined,
      depositPaid: body.depositPaid !== undefined ? parseFloat(body.depositPaid) || null : undefined,
    },
    include: { customer: true, notes: true, communications: true, images: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.case.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
