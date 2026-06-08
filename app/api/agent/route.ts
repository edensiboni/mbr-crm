import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const client = new Anthropic();

async function getAllCasesContext() {
  const cases = await prisma.case.findMany({
    include: { customer: true, notes: true, communications: true },
    orderBy: { createdAt: "desc" },
  });

  return cases.map((c) => ({
    caseNumber: c.caseNumber,
    title: c.title,
    status: c.status,
    priority: c.priority,
    customer: { name: c.customer.name, phone: c.customer.phone, email: c.customer.email },
    laptopModel: c.laptopModel,
    serialNumber: c.serialNumber,
    issueType: c.issueType,
    issueDescription: c.issueDescription,
    physicalCondition: c.physicalCondition,
    diagnosticNotes: c.diagnosticNotes,
    repairNotes: c.repairNotes,
    partsUsed: c.partsUsed,
    estimatedCost: c.estimatedCost,
    finalCost: c.finalCost,
    depositPaid: c.depositPaid,
    createdAt: c.createdAt,
    completedAt: c.completedAt,
    notes: c.notes.map((n) => n.content),
    communications: c.communications.map((cm) => `[${cm.type}/${cm.direction}] ${cm.content}`),
  }));
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const cases = await getAllCasesContext();
  const casesSummary = JSON.stringify(cases, null, 2);

  const systemPrompt = `You are the M.B.R (Mac Book Repair) AI Agent — a smart assistant for the repair engineer.
You have full access to all repair cases in the system.

Today's date: ${new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

CURRENT CASES DATA:
${casesSummary}

You can answer questions about:
- Specific repair cases (by case number, customer name, status, etc.)
- Customer details and contact info
- Repair status summaries and statistics
- Which cases are overdue, urgent, or awaiting parts
- Cost estimates and financial summaries
- Diagnostic and repair notes
- Any other information from the cases above

Be concise, professional, and helpful. Format lists and tables clearly.
If asked about something not in the data, say so honestly.`;

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return NextResponse.json({ reply: text });
}
