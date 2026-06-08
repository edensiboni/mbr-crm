"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, Clock, DollarSign, Wrench, MessageSquare, StickyNote, Trash2, CheckCircle } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/utils";
import { format } from "date-fns";

interface Case {
  id: string; caseNumber: string; title: string; status: string; priority: string;
  laptopModel: string; serialNumber?: string; purchaseYear?: number; issueType: string;
  issueDescription: string; physicalCondition: string; diagnosticNotes?: string;
  repairNotes?: string; partsUsed?: string; estimatedCost?: number; finalCost?: number;
  depositPaid?: number; estimatedCompletion?: string; completedAt?: string; createdAt: string;
  customer: { id: string; name: string; phone: string; email?: string; address?: string };
  notes: { id: string; content: string; createdAt: string }[];
  communications: { id: string; type: string; direction: string; content: string; createdAt: string }[];
}

const STATUSES = ["intake","diagnosing","awaiting_parts","in_repair","testing","ready","completed","cancelled"];

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [c, setC] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [commContent, setCommContent] = useState("");
  const [commType, setCommType] = useState("phone");
  const [commDir, setCommDir] = useState("outbound");
  const [activeTab, setActiveTab] = useState("details");

  const load = useCallback(async () => {
    const res = await fetch(`/api/cases/${id}`);
    if (res.ok) setC(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const patch = async (data: Record<string, unknown>) => {
    setSaving(true);
    const res = await fetch(`/api/cases/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) setC(await res.json());
    setSaving(false);
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
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
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={c.status} onChange={e => patch({ status: e.target.value })}
            className={`text-xs px-3 py-2 rounded-xl font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[c.status]}`}>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <button onClick={deleteCase} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          {saving && <span className="text-xs text-gray-400">Saving…</span>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column */}
        <div className="col-span-2 space-y-4">
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
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Device & Issue</h3>
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
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Estimated Cost", field: "estimatedCost", value: c.estimatedCost },
                  { label: "Deposit Paid", field: "depositPaid", value: c.depositPaid },
                  { label: "Final Cost", field: "finalCost", value: c.finalCost },
                ].map(item => (
                  <div key={item.field} className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">{item.label}</label>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 text-sm">$</span>
                      <input type="number" step="0.01" className="bg-transparent text-lg font-semibold text-gray-900 w-full focus:outline-none"
                        defaultValue={item.value ?? ""}
                        onBlur={e => patch({ [item.field]: e.target.value })} placeholder="0.00" />
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
              <input className={`${inputCls} flex-1`} placeholder="Add a note…" value={newNote} onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addNote()} />
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
            <div className="flex gap-2 mb-4 flex-wrap">
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
              <Link href={`/dashboard/customers`} className="text-xs text-blue-500 hover:text-blue-600">View customer profile →</Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Quick Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Priority</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[c.priority]}`}>{PRIORITY_LABELS[c.priority]}</span>
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
            <button onClick={() => patch({ status: "completed" })}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
              <CheckCircle className="w-4 h-4" /> Mark as Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
