import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { images: { orderBy: { createdAt: "asc" } } },
  });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(listing);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const listing = await prisma.listing.update({
    where: { id },
    data: {
      ...body,
      year: body.year !== undefined ? parseInt(body.year) : undefined,
      price: body.price !== undefined ? parseFloat(body.price) : undefined,
      batteryHealth: body.batteryHealth !== undefined
        ? (body.batteryHealth ? parseInt(body.batteryHealth) : null)
        : undefined,
    },
    include: { images: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(listing);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.listing.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
