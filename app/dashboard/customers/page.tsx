import { prisma } from "@/lib/db";
import Link from "next/link";
import { Users, Phone, Mail, FolderOpen, Edit2 } from "lucide-react";
import { format } from "date-fns";

interface SearchParams { q?: string; }

async function getCustomers(q?: string) {
  return prisma.customer.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }, { email: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cases: true } }, cases: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
}

export default async function CustomersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const customers = await getCustomers(params.q);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{customers.length} customer{customers.length !== 1 ? "s" : ""} on record</p>
        </div>
        <Link href="/dashboard/cases/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          + New Case
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <form method="GET">
          <input name="q" defaultValue={params.q} type="search" placeholder="Search by name, phone, or email…"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </form>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Users className="w-12 h-12 mb-4 opacity-40" />
          <p className="font-medium text-gray-600 mb-1">No customers yet</p>
          <p className="text-sm">Customers are added when you create a repair case.</p>
          <Link href="/dashboard/cases/new" className="mt-4 text-blue-600 hover:text-blue-700 text-sm">Create first case →</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {customers.map(cu => (
            <div key={cu.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {cu.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                    {cu._count.cases} case{cu._count.cases !== 1 ? "s" : ""}
                  </span>
                  <Link href={`/dashboard/customers/${cu.id}`} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{cu.name}</h3>
              <div className="space-y-1.5 mb-4">
                <a href={`tel:${cu.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {cu.phone}
                </a>
                {cu.email && (
                  <a href={`mailto:${cu.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> {cu.email}
                  </a>
                )}
              </div>
              {cu.cases[0] && (
                <div className="border-t border-gray-50 pt-3 mb-3">
                  <p className="text-xs text-gray-400 mb-1">Latest repair</p>
                  <Link href={`/dashboard/cases/${cu.cases[0].id}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    <FolderOpen className="w-3.5 h-3.5" />
                    {cu.cases[0].title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{format(new Date(cu.cases[0].createdAt), "MMM d, yyyy")}</p>
                </div>
              )}
              <p className="text-xs text-gray-400">Customer since {format(new Date(cu.createdAt), "MMM yyyy")}</p>
              <Link href={`/dashboard/customers/${cu.id}`} className="mt-3 block text-xs text-blue-500 hover:text-blue-600 transition-colors">View profile & edit →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
