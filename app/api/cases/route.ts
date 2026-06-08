import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCaseNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { caseNumber: { contains: q } },
      { customer: { name: { contains: q } } },
      { laptopModel: { contains: q } },
    ];
  }

  const cases = await prisma.case.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return NextResponse.json(cases);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    customerId, newCustomer, title, priority, laptopModel,
    serialNumber, purchaseYear, issueType, issueDescription,
    physicalCondition, estimatedCost, depositPaid, estimatedCompletion,
  } = body;

  let resolvedCustomerId = customerId;

  if (newCustomer) {
    const customer = await prisma.customer.create({
      data: {
        name: newCustomer.name,
        email: newCustomer.email || undefined,
        phone: newCustomer.phone,
        address: newCustomer.address || undefined,
        notes: newCustomer.notes || undefined,
      },
    });
    resolvedCustomerId = customer.id;
  }

  const newCase = await prisma.case.create({
    data: {
      caseNumber: generateCaseNumber(),
      customerId: resolvedCustomerId,
      title,
      priority: priority || "normal",
      laptopModel,
      serialNumber: serialNumber || undefined,
      purchaseYear: purchaseYear ? parseInt(purchaseYear) : undefined,
      issueType,
      issueDescription,
      physicalCondition: physicalCondition || "good",
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      depositPaid: depositPaid ? parseFloat(depositPaid) : undefined,
      estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : undefined,
    },
    include: { customer: true },
  });

  return NextResponse.json(newCase, { status: 201 });
}
