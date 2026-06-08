"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Laptop, Wrench, DollarSign } from "lucide-react";
import { ISSUE_TYPES, MACBOOK_MODELS } from "@/lib/utils";

interface Customer { id: string; name: string; phone: string; email?: string | null; }

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerMode, setCustomerMode] = useState<"new" | "existing">("new");
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const [form, setForm] = useState({
    // New customer
    custName: "", custPhone: "", custEmail: "", custAddress: "",
    // Case
    title: "", priority: "normal", laptopModel: "", serialNumber: "",
    purchaseYear: "", issueType: "", issueDescription: "", physicalCondition: "good",
    estimatedCost: "", depositPaid: "", estimatedCompletion: "",
  });

  useEffect(() => {
    fetch("/api/customers").then(r => r.json()).then(setCustomers);
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: Record<string, unknown> = {
      title: form.title || `${form.issueType} — ${form.laptopModel}`,
      priority: form.priority,
      laptopModel: form.laptopModel,
      serialNumber: form.serialNumber,
      purchaseYear: form.purchaseYear,
      issueType: form.issueType,
      issueDescription: form.issueDescription,
      physicalCondition: form.physicalCondition,
      estimatedCost: form.estimatedCost,
      depositPaid: form.depositPaid,
      estimatedCompletion: form.estimatedCompletion,
    };

    if (customerMode === "new") {
      payload.newCustomer = { name: form.custName, phone: form.custPhone, email: form.custEmail, address: form.custAddress };
    } else {
      payload.customerId = selectedCustomer;
    }

    const res = await fetch("/api/cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      const data = await res.json();
      router.push(`/dashboard/cases/${data.id}`);
    } else {
      alert("Error creating case. Please fill all required fields.");
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/cases" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Repair Case</h1>
          <p className="text-gray-500 text-sm">Fill in the customer and device information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Customer Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Customer Information</h2>
          </div>

          <div className="flex gap-2 mb-5">
            <button type="button" onClick={() => setCustomerMode("new")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${customerMode === "new" ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              New Customer
            </button>
            <button type="button" onClick={() => setCustomerMode("existing")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${customerMode === "existing" ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              Existing Customer ({customers.length})
            </button>
          </div>

          {customerMode === "new" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input required className={inputCls} placeholder="John Doe" value={form.custName} onChange={e => set("custName", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Phone Number *</label>
                <input required className={inputCls} placeholder="+1 (555) 000-0000" value={form.custPhone} onChange={e => set("custPhone", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" className={inputCls} placeholder="john@email.com" value={form.custEmail} onChange={e => set("custEmail", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <input className={inputCls} placeholder="123 Main St, City" value={form.custAddress} onChange={e => set("custAddress", e.target.value)} />
              </div>
            </div>
          ) : (
            <div>
              <label className={labelCls}>Select Customer *</label>
              <select required={customerMode === "existing"} className={inputCls} value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                <option value="">— Choose a customer —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Device Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Laptop className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Device Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>MacBook Model *</label>
              <select required className={inputCls} value={form.laptopModel} onChange={e => set("laptopModel", e.target.value)}>
                <option value="">— Select model —</option>
                {MACBOOK_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Serial Number</label>
              <input className={inputCls} placeholder="e.g. C02XL0LFJG5J" value={form.serialNumber} onChange={e => set("serialNumber", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Purchase Year</label>
              <input type="number" className={inputCls} placeholder="e.g. 2022" min="2000" max="2025" value={form.purchaseYear} onChange={e => set("purchaseYear", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Physical Condition *</label>
              <select required className={inputCls} value={form.physicalCondition} onChange={e => set("physicalCondition", e.target.value)}>
                <option value="excellent">Excellent — Like new</option>
                <option value="good">Good — Minor wear</option>
                <option value="fair">Fair — Visible wear/dents</option>
                <option value="poor">Poor — Heavy damage</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issue Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Issue Details</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Issue Type *</label>
              <select required className={inputCls} value={form.issueType} onChange={e => set("issueType", e.target.value)}>
                <option value="">— Select issue type —</option>
                {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Priority *</label>
              <select required className={inputCls} value={form.priority} onChange={e => set("priority", e.target.value)}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Case Title (optional — auto-generated if blank)</label>
              <input className={inputCls} placeholder="e.g. Screen replacement after drop damage" value={form.title} onChange={e => set("title", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Issue Description *</label>
              <textarea required rows={4} className={`${inputCls} resize-none`}
                placeholder="Describe the issue in detail — what the customer reported, when it started, any relevant history…"
                value={form.issueDescription} onChange={e => set("issueDescription", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Financials */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Financials & Timeline</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Estimated Cost ($)</label>
              <input type="number" step="0.01" className={inputCls} placeholder="0.00" value={form.estimatedCost} onChange={e => set("estimatedCost", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Deposit Paid ($)</label>
              <input type="number" step="0.01" className={inputCls} placeholder="0.00" value={form.depositPaid} onChange={e => set("depositPaid", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Estimated Completion</label>
              <input type="date" className={inputCls} value={form.estimatedCompletion} onChange={e => set("estimatedCompletion", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Link href="/dashboard/cases" className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {loading ? "Creating…" : "Create Case"}
          </button>
        </div>
      </form>
    </div>
  );
}
