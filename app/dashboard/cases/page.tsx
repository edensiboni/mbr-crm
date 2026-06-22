import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/utils";
import { format } from "date-fns";

interface SearchParams { status?: string; q?: string; }

async function getCases(filters: SearchParams) {
  const where: Record<string, unknown> = {};
  if (filters.status) where.status = filters.status;
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q } },
      { caseNumber: { contains: filters.q } },
      { customer: { name: { contains: filters.q } } },
      { laptopModel: { contains: filters.q } },
    ];
  }
  return prisma.case.findMany({ where, orderBy: { createdAt: "desc" }, include: { customer: true } });
}

const STATUSES = ["intake","diagnosing","awaiting_parts","in_repair","testing","ready","completed","cancelled"];

export default async function CasesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const cases = await getCases(params);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Cases</h1>
          <p className="text-gray-500 text-sm mt-0.5">{cases.length} repair{cases.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/cases/new"
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /><span className="hidden sm:inline">New Case</span><span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 md:p-4 mb-5 space-y-3">
        <form method="GET">
          <input name="q" defaultValue={params.q} type="search"
            placeholder="Search cases, customers, device…"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </form>
        <div className="flex flex-wrap gap-1.5">
          <Link href="/dashboard/cases"
            className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${!params.status ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
            All
          </Link>
          {STATUSES.map(s => (
            <Link key={s} href={`/dashboard/cases?status=${s}`}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${params.status === s ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="font-medium text-gray-600 mb-1">No cases found</p>
          <p className="text-sm">Try adjusting filters or create a new case.</p>
          <Link href="/dashboard/cases/new"
            className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Case
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {cases.map(c => (
              <Link key={c.id} href={`/dashboard/cases/${c.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">{c.title}</p>
                    <p className="text-gray-400 text-xs font-mono mt-0.5">{c.caseNumber}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[c.status]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>{c.customer.name} · {c.customer.phone}</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[c.priority]}`}>
                    {PRIORITY_LABELS[c.priority]}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{c.laptopModel} · {c.issueType}</p>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">Case</th>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Device</th>
                  <th className="px-6 py-3 text-left">Issue</th>
                  <th className="px-6 py-3 text-left">Priority</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cases.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/cases/${c.id}`} className="block">
                        <div className="font-medium text-gray-900 text-sm hover:text-blue-600">{c.title}</div>
                        <div className="text-gray-400 text-xs font-mono">{c.caseNumber}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{c.customer.name}</div>
                      <div className="text-xs text-gray-400">{c.customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.laptopModel}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.issueType}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_COLORS[c.priority]}`}>{PRIORITY_LABELS[c.priority]}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">{format(new Date(c.createdAt), "MMM d, yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
