"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Laptop, Wrench, DollarSign, Camera, Upload, X, CheckCircle, ImageIcon, FolderOpen } from "lucide-react";
import { ISSUE_TYPES, MACBOOK_MODELS } from "@/lib/utils";

interface Customer { id: string; name: string; phone: string; email?: string | null; }
type Step = "form" | "photos";

export default function NewCasePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerMode, setCustomerMode] = useState<"new" | "existing">("new");
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const [intakeFiles, setIntakeFiles] = useState<File[]>([]);
  const [intakePreviews, setIntakePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(0);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    custName: "", custPhone: "", custEmail: "", custAddress: "",
    title: "", priority: "normal", laptopModel: "", serialNumber: "",
    purchaseYear: "", issueType: "", issueDescription: "", physicalCondition: "good",
    estimatedCost: "", depositPaid: "", estimatedCompletion: "",
  });

  useEffect(() => {
    fetch("/api/customers").then(r => r.json()).then(setCustomers);
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const payload: Record<string, unknown> = {
      title: form.title || `${form.issueType} — ${form.laptopModel}`,
      priority: form.priority, laptopModel: form.laptopModel,
      serialNumber: form.serialNumber, purchaseYear: form.purchaseYear,
      issueType: form.issueType, issueDescription: form.issueDescription,
      physicalCondition: form.physicalCondition, estimatedCost: form.estimatedCost,
      depositPaid: form.depositPaid, estimatedCompletion: form.estimatedCompletion,
    };

    if (customerMode === "new") {
      payload.newCustomer = { name: form.custName, phone: form.custPhone, email: form.custEmail, address: form.custAddress };
    } else {
      payload.customerId = selectedCustomer;
    }

    const res = await fetch("/api/cases", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      setCreatedCaseId(data.id);
      setStep("photos");
    } else {
      alert("Error creating case. Please fill all required fields.");
    }
    setFormLoading(false);
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    setIntakeFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setIntakePreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }, []);

  const removeFile = (index: number) => {
    setIntakeFiles(prev => prev.filter((_, i) => i !== index));
    setIntakePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAndFinish = async () => {
    if (!createdCaseId || intakeFiles.length === 0) return;
    setUploading(true);
    for (const file of intakeFiles) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "intake");
      await fetch(`/api/cases/${createdCaseId}/images`, { method: "POST", body: fd });
      setUploaded(n => n + 1);
    }
    router.push(`/dashboard/cases/${createdCaseId}`);
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  // ── STEP 2: Photo upload ──────────────────────────────────────────────
  if (step === "photos") {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Case Created!</h1>
          </div>
          <p className="text-gray-500 text-sm ml-11">
            Upload intake photos of the device as proof of condition on arrival.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Camera className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Intake Photos</h2>
            <span className="text-xs text-red-500 font-medium">* min. 1 required</span>
          </div>

          {/* Camera / File buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Take photo — opens camera directly */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <Camera className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Take Photo</span>
            </button>

            {/* Choose from files / gallery */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <FolderOpen className="w-6 h-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Choose File</span>
            </button>
          </div>

          {/* Hidden inputs */}
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
            multiple className="hidden" onChange={e => handleFileSelect(e.target.files)} />
          <input ref={fileInputRef} type="file" accept="image/*"
            multiple className="hidden" onChange={e => handleFileSelect(e.target.files)} />

          {/* Drag & drop fallback for desktop */}
          <label
            className="hidden md:flex flex-col items-center justify-center w-full h-20 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-colors mb-4"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFileSelect(e.dataTransfer.files); }}
          >
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFileSelect(e.target.files)} />
            <Upload className="w-5 h-5 text-gray-300 mb-1" />
            <span className="text-xs text-gray-400">or drag & drop here</span>
          </label>

          {/* Previews */}
          {intakePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {intakePreviews.map((src, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeFile(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {intakePreviews.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <ImageIcon className="w-4 h-4 shrink-0" />
              At least one photo is required to document the device condition on intake.
            </div>
          )}
        </div>

        {uploading && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-sm text-blue-700">
            Uploading {uploaded} / {intakeFiles.length} photos…
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={handleUploadAndFinish}
            disabled={intakeFiles.length === 0 || uploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading…" : `Upload ${intakeFiles.length > 0 ? `${intakeFiles.length} Photo${intakeFiles.length > 1 ? "s" : ""}` : "Photos"} & Open Case`}
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 1: Case form ─────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
          Case Details
        </div>
        <div className="h-px w-6 bg-gray-200" />
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center">2</span>
          Intake Photos
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/cases" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">New Repair Case</h1>
          <p className="text-gray-500 text-sm">Fill in customer and device details</p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Customer */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Customer</h2>
          </div>
          <div className="flex gap-2 mb-4">
            <button type="button" onClick={() => setCustomerMode("new")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${customerMode === "new" ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              New Customer
            </button>
            <button type="button" onClick={() => setCustomerMode("existing")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${customerMode === "existing" ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              Existing ({customers.length})
            </button>
          </div>
          {customerMode === "new" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input required className={inputCls} placeholder="John Doe" value={form.custName} onChange={e => set("custName", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <input required className={inputCls} placeholder="+1 (555) 000-0000" value={form.custPhone} onChange={e => set("custPhone", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" className={inputCls} placeholder="john@email.com" value={form.custEmail} onChange={e => set("custEmail", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <input className={inputCls} placeholder="123 Main St" value={form.custAddress} onChange={e => set("custAddress", e.target.value)} />
              </div>
            </div>
          ) : (
            <div>
              <label className={labelCls}>Select Customer *</label>
              <select required={customerMode === "existing"} className={inputCls} value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                <option value="">— Choose a customer —</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Device */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Laptop className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Device</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>MacBook Model *</label>
              <select required className={inputCls} value={form.laptopModel} onChange={e => set("laptopModel", e.target.value)}>
                <option value="">— Select model —</option>
                {MACBOOK_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Serial Number</label>
              <input className={inputCls} placeholder="C02XL0LFJG5J" value={form.serialNumber} onChange={e => set("serialNumber", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Purchase Year</label>
              <input type="number" className={inputCls} placeholder="2022" min="2000" max="2030" value={form.purchaseYear} onChange={e => set("purchaseYear", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
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

        {/* Issue */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Issue</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Issue Type *</label>
              <select required className={inputCls} value={form.issueType} onChange={e => set("issueType", e.target.value)}>
                <option value="">— Select type —</option>
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
            <div className="sm:col-span-2">
              <label className={labelCls}>Case Title <span className="text-gray-400 font-normal">(auto-generated if blank)</span></label>
              <input className={inputCls} placeholder="e.g. Screen replacement after drop" value={form.title} onChange={e => set("title", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Issue Description *</label>
              <textarea required rows={4} className={`${inputCls} resize-none`}
                placeholder="What the customer reported, when it started, any relevant history…"
                value={form.issueDescription} onChange={e => set("issueDescription", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Financials */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Financials & Timeline</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Est. Cost ($)</label>
              <input type="number" step="0.01" className={inputCls} placeholder="0.00" value={form.estimatedCost} onChange={e => set("estimatedCost", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Deposit Paid ($)</label>
              <input type="number" step="0.01" className={inputCls} placeholder="0.00" value={form.depositPaid} onChange={e => set("depositPaid", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Est. Completion</label>
              <input type="date" className={inputCls} value={form.estimatedCompletion} onChange={e => set("estimatedCompletion", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <Camera className="w-5 h-5 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-700">
            Next you&apos;ll upload <strong>intake photos</strong> — you can use your camera or choose from files.
          </p>
        </div>

        <div className="flex gap-3 justify-end pb-4">
          <Link href="/dashboard/cases" className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={formLoading}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {formLoading ? "Saving…" : "Save & Add Photos →"}
          </button>
        </div>
      </form>
    </div>
  );
}
