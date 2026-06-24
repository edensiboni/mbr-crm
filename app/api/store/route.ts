import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const listings = await prisma.listing.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(listings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const listing = await prisma.listing.create({
    data: {
      title: body.title,
      model: body.model,
      year: parseInt(body.year),
      price: parseFloat(body.price),
      condition: body.condition ?? "good",
      ram: body.ram || null,
      storage: body.storage || null,
      processor: body.processor || null,
      color: body.color || null,
      batteryHealth: body.batteryHealth ? parseInt(body.batteryHealth) : null,
      description: body.description || null,
      status: body.status ?? "available",
    },
    include: { images: true },
  });
  return NextResponse.json(listing, { status: 201 });
}
