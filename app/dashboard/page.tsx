import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  FolderOpen,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import { format } from "date-fns";

async function getStats() {
  const [totalCases, totalCustomers, openCases, completedToday, recentCases, statusBreakdown] =
    await Promise.all([
      prisma.case.count(),
      prisma.customer.count(),
      prisma.case.count({
        where: { status: { notIn: ["completed", "cancelled"] } },
      }),
      prisma.case.count({
        where: {
          status: "completed",
          completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.case.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      }),
      prisma.case.groupBy({
        by: ["status"],
        _count: { id: true },
        where: { status: { notIn: ["completed", "cancelled"] } },
      }),
    ]);

  return { totalCases, totalCustomers, openCases, completedToday, recentCases, statusBreakdown };
}

export default async function DashboardPage() {
  const { totalCases, totalCustomers, openCases, completedToday, recentCases, statusBreakdown } =
    await getStats();

  const stats = [
    { label: "Total Cases", value: totalCases, icon: FolderOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Customers", value: totalCustomers, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Active Repairs", value: openCases, icon: Wrench, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Completed Today", value: completedToday, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Link
          href="/dashboard/cases/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Case
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Recent Cases</h2>
            <Link
              href="/dashboard/cases"
              className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FolderOpen className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No cases yet</p>
              <Link
                href="/dashboard/cases/new"
                className="mt-3 text-blue-600 text-sm hover:text-blue-700"
              >
                Create your first case →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentCases.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/cases/${c.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-gray-900 text-sm truncate">
                        {c.title}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {c.caseNumber} · {c.customer.name} · {c.laptopModel}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[c.status]}`}
                  >
                    {STATUS_LABELS[c.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Active by Status</h2>
          </div>
          {statusBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <TrendingUp className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No active cases</p>
            </div>
          ) : (
            <div className="p-6 space-y-3">
              {statusBreakdown.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[s.status]}`}
                  >
                    {STATUS_LABELS[s.status] || s.status}
                  </span>
                  <span className="font-semibold text-gray-900">{s._count.id}</span>
                </div>
              ))}
            </div>
          )}
          <div className="px-6 pb-6">
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-800">
                You have <strong>{openCases}</strong> active repair
                {openCases !== 1 ? "s" : ""} in progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
