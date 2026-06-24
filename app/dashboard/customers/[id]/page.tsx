"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, FolderOpen, Check, Edit2, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";

interface Case { id: string; caseNumber: string; title: string; status: string; createdAt: string; estimatedCost?: number; finalCost?: number; }
interface Customer { id: string; name: string; phone: string; email?: string; address?: string; notes?: string; createdAt: string; cases: Case[]; }

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  const load = useCallback(async () => {
    const res = await fetch(`/api/customers/${id}`);
    if (res.ok) {
      const data: Customer = await res.json();
      setCustomer(data);
      setForm({ name: data.name, phone: data.phone, email: data.email ?? "", address: data.address ?? "", notes: data.notes ?? "" });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        address: form.address || null,
        notes: form.notes || null,
      }),
    });
    if (res.ok) { setCustomer(await res.json()); setEditing(false); }
    setSaving(false);
  };

  const deleteCustomer = async () => {
    if (!confirm(`Delete ${customer?.name} and all their cases? This cannot be undone.`)) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    router.push("/dashboard/customers");
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;
  if (!customer) return <div className="p-8 text-gray-500">Customer not found.</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/customers" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-400 mt-0.5">Customer since {format(new Date(customer.createdAt), "MMMM yyyy")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                <Check className="w-4 h-4" />{saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={deleteCustomer} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Contact info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4">
              {customer.name.charAt(0).toUpperCase()}
            </div>

            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Full Name</label>
                  <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Phone</label>
                  <input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Email</label>
                  <input type="email" className={inputCls} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="optional" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Address</label>
                  <input className={inputCls} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="optional" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Notes</label>
                  <textarea rows={3} className={`${inputCls} resize-none`} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Internal notes about this customer…" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-semibold text-gray-900">{customer.name}</p>
                <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                  <Phone className="w-4 h-4" /> {customer.phone}
                </a>
                {customer.email && (
                  <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                    <Mail className="w-4 h-4" /> {customer.email}
                  </a>
                )}
                {customer.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {customer.address}
                  </div>
                )}
                {customer.notes && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-sm text-gray-700 mt-2">
                    {customer.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cases */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Repair History</h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">{customer.cases.length} case{customer.cases.length !== 1 ? "s" : ""}</span>
            </div>

            {customer.cases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FolderOpen className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">No repair cases yet</p>
                <Link href="/dashboard/cases/new" className="mt-3 text-blue-600 hover:text-blue-700 text-sm">Create first case →</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {customer.cases.map(c => (
                  <Link key={c.id} href={`/dashboard/cases/${c.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <FolderOpen className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                        <p className="text-xs text-gray-400">{c.caseNumber} · {format(new Date(c.createdAt), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      {(c.finalCost ?? c.estimatedCost) && (
                        <span className="text-xs font-medium text-gray-700">${(c.finalCost ?? c.estimatedCost)!.toFixed(0)}</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
