import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  const customers = await prisma.customer.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }, { email: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cases: true } } },
  });

  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const customer = await prisma.customer.create({
    data: {
      name: body.name,
      email: body.email || undefined,
      phone: body.phone,
      address: body.address || undefined,
      notes: body.notes || undefined,
    },
  });
  return NextResponse.json(customer, { status: 201 });
}
