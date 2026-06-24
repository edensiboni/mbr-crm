"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, Mail, MapPin, Clock,
  MessageSquare, StickyNote, Trash2, CheckCircle, Camera, Upload,
  X, ImageIcon, ZoomIn, FolderOpen, Edit2, Check,
} from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/utils";
import { format } from "date-fns";

interface CaseImage { id: string; type: string; url: string; filename: string; createdAt: string; }

interface Case {
  id: string; caseNumber: string; title: string; status: string; priority: string;
  laptopModel: string; serialNumber?: string; purchaseYear?: number; issueType: string;
  issueDescription: string; physicalCondition: string; diagnosticNotes?: string;
  repairNotes?: string; partsUsed?: string; estimatedCost?: number; finalCost?: number;
  depositPaid?: number; estimatedCompletion?: string; completedAt?: string; createdAt: string;
  customer: { id: string; name: string; phone: string; email?: string; address?: string };
  notes: { id: string; content: string; createdAt: string }[];
  communications: { id: string; type: string; direction: string; content: string; createdAt: string }[];
  images: CaseImage[];
}

const STATUSES = ["intake","diagnosing","awaiting_parts","in_repair","testing","ready","completed","cancelled"];

// ── Completion Photo Modal ────────────────────────────────────────────────────
function CompletionPhotoModal({
  caseId,
  onSuccess,
  onCancel,
}: {
  caseId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(0);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).filter(f => f.type.startsWith("image/"));
    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "completion");
      await fetch(`/api/cases/${caseId}/images`, { method: "POST", body: fd });
      setUploaded(n => n + 1);
    }
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Camera className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Completion Photos Required</h3>
              <p className="text-xs text-gray-400">Upload photos of the repaired device before closing</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Camera / File buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button type="button" onClick={() => cameraRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 h-20 border-2 border-dashed border-green-200 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
              <Camera className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-green-700">Take Photo</span>
            </button>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 h-20 border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-colors">
              <FolderOpen className="w-6 h-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Choose File</span>
            </button>
          </div>

          <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={e => handleFileSelect(e.target.files)} />
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFileSelect(e.target.files)} />

          {/* Desktop drag-and-drop */}
          <label className="hidden sm:flex flex-col items-center justify-center w-full h-16 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-300 hover:bg-green-50/40 transition-colors mb-4"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFileSelect(e.dataTransfer.files); }}>
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFileSelect(e.target.files)} />
            <span className="text-xs text-gray-400">or drag & drop here</span>
          </label>

          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {previews.map((src, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4">
              <ImageIcon className="w-4 h-4 shrink-0" />
              At least one completion photo is required to close this case.
            </div>
          )}

          {uploading && (
            <div className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
              Uploading {uploaded} / {files.length}…
            </div>
          )}
        </div>

        <div className="flex gap-3 px-5 pb-5 justify-end">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleUpload} disabled={files.length === 0 || uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading…" : "Upload & Close Case"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Image Lightbox ────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Full size" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
        <X className="w-7 h-7" />
      </button>
    </div>
  );
}

// ── Image Gallery Section ─────────────────────────────────────────────────────
function ImageGallery({ images, type, label }: { images: CaseImage[]; type: string; label: string }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const filtered = images.filter(img => img.type === type);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Camera className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{filtered.length}</span>
      </div>
      {filtered.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
          <ImageIcon className="w-4 h-4" />
          No {label.toLowerCase()} uploaded
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {filtered.map(img => (
            <button
              key={img.id}
              onClick={() => setLightbox(img.url)}
              className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 hover:ring-2 hover:ring-blue-500 transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      )}
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [c, setC] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patchError, setPatchError] = useState("");
  const [newNote, setNewNote] = useState("");
  const [commContent, setCommContent] = useState("");
  const [commType, setCommType] = useState("phone");
  const [commDir, setCommDir] = useState("outbound");
  const [activeTab, setActiveTab] = useState("details");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(false);
  const [deviceForm, setDeviceForm] = useState<Record<string, string>>({});
  const statusSelectRef = useRef<HTMLSelectElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/cases/${id}`);
    if (res.ok) setC(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const patch = async (data: Record<string, unknown>) => {
    setSaving(true);
    setPatchError("");
    const res = await fetch(`/api/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setC(await res.json());
    } else {
      const err = await res.json();
      setPatchError(err.error || "Failed to update case.");
      // Reset the select back to the previous status
      if (statusSelectRef.current && c) statusSelectRef.current.value = c.status;
    }
    setSaving(false);
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === "completed") {
      // Show modal to collect completion photos first
      setShowCompletionModal(true);
    } else {
      patch({ status: newStatus });
    }
  };

  const handleCompletionSuccess = async () => {
    setShowCompletionModal(false);
    await patch({ status: "completed" });
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    await fetch(`/api/cases/${id}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: newNote }) });
    setNewNote("");
    load();
  };

  const addComm = async () => {
    if (!commContent.trim()) return;
    await fetch(`/api/cases/${id}/communications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: commType, direction: commDir, content: commContent }) });
    setCommContent("");
    load();
  };

  const deleteCase = async () => {
    if (!confirm("Delete this case permanently?")) return;
    await fetch(`/api/cases/${id}`, { method: "DELETE" });
    router.push("/dashboard/cases");
  };

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Loading…</div>;
  if (!c) return <div className="p-8 text-gray-500">Case not found.</div>;

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const intakeImages = c.images?.filter(img => img.type === "intake") ?? [];
  const completionImages = c.images?.filter(img => img.type === "completion") ?? [];

  return (
    <>
      {showCompletionModal && (
        <CompletionPhotoModal
          caseId={id}
          onSuccess={handleCompletionSuccess}
          onCancel={() => setShowCompletionModal(false)}
        />
      )}

      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/cases" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{c.title}</h1>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_COLORS[c.priority]}`}>{PRIORITY_LABELS[c.priority]}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="font-mono">{c.caseNumber}</span>
                <span>·</span>
                <span>Opened {format(new Date(c.createdAt), "MMM d, yyyy")}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" />
                  {intakeImages.length} intake · {completionImages.length} completion
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              ref={statusSelectRef}
              value={c.status}
              onChange={e => handleStatusChange(e.target.value)}
              className={`text-xs px-3 py-2 rounded-xl font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[c.status]}`}
            >
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <button onClick={deleteCase} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            {saving && <span className="text-xs text-gray-400">Saving…</span>}
          </div>
        </div>

        {/* Error banner */}
        {patchError && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            <span>{patchError}</span>
            <button onClick={() => setPatchError("")}><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Left column */}
          <div className="md:col-span-2 space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
              {["details","repair","financials"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "details" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Device & Issue</h3>
                    {editingDevice ? (
                      <div className="flex gap-2">
                        <button onClick={() => setEditingDevice(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-3.5 h-3.5" /></button>
                        <button onClick={async () => { await patch(deviceForm); setEditingDevice(false); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                          <Check className="w-3 h-3" /> Save
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setDeviceForm({ title: c.title, laptopModel: c.laptopModel, serialNumber: c.serialNumber ?? "", purchaseYear: c.purchaseYear?.toString() ?? "", issueType: c.issueType, issueDescription: c.issueDescription, physicalCondition: c.physicalCondition, priority: c.priority }); setEditingDevice(true); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {editingDevice ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Case Title</label>
                        <input className={inputCls} value={deviceForm.title ?? ""} onChange={e => setDeviceForm(f => ({ ...f, title: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Model</label>
                          <input className={inputCls} value={deviceForm.laptopModel ?? ""} onChange={e => setDeviceForm(f => ({ ...f, laptopModel: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Serial #</label>
                          <input className={inputCls} value={deviceForm.serialNumber ?? ""} onChange={e => setDeviceForm(f => ({ ...f, serialNumber: e.target.value }))} placeholder="optional" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Purchase Year</label>
                          <input type="number" className={inputCls} value={deviceForm.purchaseYear ?? ""} onChange={e => setDeviceForm(f => ({ ...f, purchaseYear: e.target.value }))} placeholder="optional" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Issue Type</label>
                          <input className={inputCls} value={deviceForm.issueType ?? ""} onChange={e => setDeviceForm(f => ({ ...f, issueType: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Condition</label>
                          <select className={inputCls} value={deviceForm.physicalCondition ?? ""} onChange={e => setDeviceForm(f => ({ ...f, physicalCondition: e.target.value }))}>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Priority</label>
                          <select className={inputCls} value={deviceForm.priority ?? ""} onChange={e => setDeviceForm(f => ({ ...f, priority: e.target.value }))}>
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Issue Description</label>
                        <textarea rows={3} className={`${inputCls} resize-none`} value={deviceForm.issueDescription ?? ""} onChange={e => setDeviceForm(f => ({ ...f, issueDescription: e.target.value }))} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-400 block mb-0.5">Model</span><span className="font-medium">{c.laptopModel}</span></div>
                        <div><span className="text-gray-400 block mb-0.5">Serial</span><span className="font-medium">{c.serialNumber || "—"}</span></div>
                        <div><span className="text-gray-400 block mb-0.5">Issue Type</span><span className="font-medium">{c.issueType}</span></div>
                        <div><span className="text-gray-400 block mb-0.5">Condition</span><span className="font-medium capitalize">{c.physicalCondition}</span></div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm block mb-1">Issue Description</span>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{c.issueDescription}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Photos */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-gray-400" /> Case Photos
                  </h3>
                  <ImageGallery images={c.images ?? []} type="intake" label="Intake Photos" />
                  <ImageGallery images={c.images ?? []} type="completion" label="Completion Photos" />
                </div>
              </div>
            )}

            {activeTab === "repair" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Repair Notes</h3>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Diagnostic Notes</label>
                  <textarea rows={3} className={`${inputCls} resize-none`} defaultValue={c.diagnosticNotes || ""}
                    onBlur={e => patch({ diagnosticNotes: e.target.value })} placeholder="Diagnostic findings…" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Repair Notes</label>
                  <textarea rows={3} className={`${inputCls} resize-none`} defaultValue={c.repairNotes || ""}
                    onBlur={e => patch({ repairNotes: e.target.value })} placeholder="What was done during repair…" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Parts Used</label>
                  <textarea rows={2} className={`${inputCls} resize-none`} defaultValue={c.partsUsed || ""}
                    onBlur={e => patch({ partsUsed: e.target.value })} placeholder="List parts and components used…" />
                </div>
              </div>
            )}

            {activeTab === "financials" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Financials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Estimated Cost", field: "estimatedCost", value: c.estimatedCost },
                    { label: "Deposit Paid", field: "depositPaid", value: c.depositPaid },
                    { label: "Final Cost", field: "finalCost", value: c.finalCost },
                  ].map(item => (
                    <div key={item.field} className="bg-gray-50 rounded-xl p-4">
                      <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">{item.label}</label>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-sm">$</span>
                        <input type="number" step="0.01"
                          className="bg-transparent text-lg font-semibold text-gray-900 w-full focus:outline-none"
                          defaultValue={item.value ?? ""}
                          onBlur={e => patch({ [item.field]: e.target.value })}
                          placeholder="0.00" />
                      </div>
                    </div>
                  ))}
                </div>
                {c.estimatedCompletion && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-xl p-3">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Est. completion: {format(new Date(c.estimatedCompletion), "MMM d, yyyy")}
                  </div>
                )}
                {c.status === "completed" && c.completedAt && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl p-3">
                    <CheckCircle className="w-4 h-4" />
                    Completed on {format(new Date(c.completedAt), "MMM d, yyyy")}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <StickyNote className="w-4 h-4 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">Internal Notes</h3>
              </div>
              <div className="flex gap-2 mb-4">
                <input className={`${inputCls} flex-1`} placeholder="Add a note…" value={newNote}
                  onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} />
                <button onClick={addNote} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors">Add</button>
              </div>
              {c.notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No notes yet</p>
              ) : (
                <div className="space-y-2">
                  {c.notes.map(n => (
                    <div key={n.id} className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                      <p className="text-sm text-gray-700">{n.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{format(new Date(n.createdAt), "MMM d, yyyy · HH:mm")}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Communications */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Communication Log</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={commType} onChange={e => setCommType(e.target.value)}>
                  <option value="phone">📞 Phone</option>
                  <option value="sms">💬 SMS</option>
                  <option value="email">📧 Email</option>
                  <option value="whatsapp">💚 WhatsApp</option>
                  <option value="in_person">🤝 In Person</option>
                </select>
                <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={commDir} onChange={e => setCommDir(e.target.value)}>
                  <option value="outbound">→ Outbound</option>
                  <option value="inbound">← Inbound</option>
                </select>
                <input className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40"
                  placeholder="Log a communication…" value={commContent} onChange={e => setCommContent(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addComm()} />
                <button onClick={addComm} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors">Log</button>
              </div>
              {c.communications.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No communications logged</p>
              ) : (
                <div className="space-y-2">
                  {c.communications.map(cm => (
                    <div key={cm.id} className={`rounded-xl p-3 border ${cm.direction === "inbound" ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">{cm.type}</span>
                        <span className="text-xs text-gray-400">{cm.direction === "inbound" ? "← Inbound" : "→ Outbound"}</span>
                      </div>
                      <p className="text-sm text-gray-700">{cm.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{format(new Date(cm.createdAt), "MMM d, yyyy · HH:mm")}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Customer card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Customer</h3>
              <div className="space-y-3">
                <div className="font-semibold text-gray-900">{c.customer.name}</div>
                <a href={`tel:${c.customer.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                  <Phone className="w-4 h-4" /> {c.customer.phone}
                </a>
                {c.customer.email && (
                  <a href={`mailto:${c.customer.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                    <Mail className="w-4 h-4" /> {c.customer.email}
                  </a>
                )}
                {c.customer.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mt-0.5" /> {c.customer.address}
                  </div>
                )}
                <Link href={`/dashboard/customers/${c.customer.id}`} className="text-xs text-blue-500 hover:text-blue-600">View & edit customer →</Link>
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <h3 className="font-semibold text-gray-900">Quick Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[c.priority]}`}>{PRIORITY_LABELS[c.priority]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Photos</span>
                  <span className="text-xs text-gray-700 font-medium">{intakeImages.length} intake · {completionImages.length} done</span>
                </div>
                {c.estimatedCost && (
                  <div className="flex justify-between"><span className="text-gray-500">Est. Cost</span>
                    <span className="font-medium text-gray-900">${c.estimatedCost.toFixed(2)}</span>
                  </div>
                )}
                {c.depositPaid && (
                  <div className="flex justify-between"><span className="text-gray-500">Deposit</span>
                    <span className="font-medium text-green-600">${c.depositPaid.toFixed(2)}</span>
                  </div>
                )}
                {c.finalCost && (
                  <div className="flex justify-between"><span className="text-gray-500">Final Cost</span>
                    <span className="font-medium text-gray-900">${c.finalCost.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mark complete */}
            {c.status !== "completed" && (
              <button
                onClick={() => setShowCompletionModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> Mark as Completed
              </button>
            )}

            {/* Completed state */}
            {c.status === "completed" && (
              <div className="flex items-center gap-2 justify-center bg-green-50 border border-green-100 text-green-700 py-3 rounded-xl text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Case Closed
                {c.completedAt && <span className="text-green-500 text-xs">· {format(new Date(c.completedAt), "MMM d")}</span>}
              </div>
            )}

            {/* Add completion photos button (for open cases) */}
            {c.status !== "completed" && (
              <button
                onClick={() => setShowCompletionModal(true)}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Camera className="w-4 h-4" /> Add Completion Photos
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
