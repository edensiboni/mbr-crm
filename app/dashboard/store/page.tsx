"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ShoppingBag, Plus, X, Camera, FolderOpen, Upload, ZoomIn, Trash2, Edit2, Check, Tag } from "lucide-react";
import { format } from "date-fns";

interface ListingImage { id: string; url: string; filename: string; createdAt: string; }
interface Listing {
  id: string; title: string; model: string; year: number; price: number;
  condition: string; ram?: string; storage?: string; processor?: string;
  color?: string; batteryHealth?: number; description?: string;
  status: string; createdAt: string; images: ListingImage[];
}

const CONDITION_LABELS: Record<string, string> = {
  excellent: "Excellent", good: "Good", fair: "Fair", parts: "For Parts",
};
const CONDITION_COLORS: Record<string, string> = {
  excellent: "bg-green-100 text-green-700",
  good: "bg-blue-100 text-blue-700",
  fair: "bg-yellow-100 text-yellow-700",
  parts: "bg-red-100 text-red-700",
};
const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  reserved: "bg-yellow-100 text-yellow-700",
  sold: "bg-gray-100 text-gray-500",
};

// ── Image Lightbox ────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-7 h-7" /></button>
    </div>
  );
}

// ── New Listing Form ──────────────────────────────────────────────────────────
function NewListingModal({ onCreated, onCancel }: { onCreated: (l: Listing) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: "", model: "", year: new Date().getFullYear().toString(), price: "",
    condition: "good", ram: "", storage: "", processor: "", color: "",
    batteryHealth: "", description: "", status: "available",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "text-xs text-gray-500 uppercase tracking-wide mb-1 block";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.model || !form.price) { setError("Title, model, and price are required."); return; }
    setSaving(true);
    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { onCreated(await res.json()); }
    else { setError("Failed to create listing."); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">New Listing</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Listing Title *</label>
              <input className={inputCls} placeholder='e.g. "MacBook Pro 13" M1 — Excellent"' value={form.title} onChange={e => set("title", e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Model *</label>
              <input className={inputCls} placeholder="MacBook Pro 13-inch" value={form.model} onChange={e => set("model", e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Year *</label>
              <input type="number" className={inputCls} min={2010} max={2030} value={form.year} onChange={e => set("year", e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Price (₪ or $) *</label>
              <input type="number" step="0.01" className={inputCls} placeholder="0.00" value={form.price} onChange={e => set("price", e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Condition</label>
              <select className={inputCls} value={form.condition} onChange={e => set("condition", e.target.value)}>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="parts">For Parts</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Processor / Chip</label>
              <input className={inputCls} placeholder="M1, M2, Intel i5…" value={form.processor} onChange={e => set("processor", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>RAM</label>
              <input className={inputCls} placeholder="8GB, 16GB, 32GB…" value={form.ram} onChange={e => set("ram", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Storage</label>
              <input className={inputCls} placeholder="256GB SSD, 512GB SSD…" value={form.storage} onChange={e => set("storage", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Color</label>
              <input className={inputCls} placeholder="Space Gray, Silver, Midnight…" value={form.color} onChange={e => set("color", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Battery Health (%)</label>
              <input type="number" min={0} max={100} className={inputCls} placeholder="85" value={form.batteryHealth} onChange={e => set("batteryHealth", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea rows={3} className={`${inputCls} resize-none`} placeholder="Additional details, included accessories, cosmetic notes…" value={form.description} onChange={e => set("description", e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              <Plus className="w-4 h-4" />{saving ? "Creating…" : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Listing Modal ────────────────────────────────────────────────────────
function EditListingModal({ listing, onSaved, onCancel }: { listing: Listing; onSaved: (l: Listing) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: listing.title, model: listing.model, year: listing.year.toString(),
    price: listing.price.toString(), condition: listing.condition,
    ram: listing.ram ?? "", storage: listing.storage ?? "", processor: listing.processor ?? "",
    color: listing.color ?? "", batteryHealth: listing.batteryHealth?.toString() ?? "",
    description: listing.description ?? "", status: listing.status,
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "text-xs text-gray-500 uppercase tracking-wide mb-1 block";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/store/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) onSaved(await res.json());
    else setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl z-10">
          <h2 className="font-semibold text-gray-900">Edit Listing</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Listing Title</label>
              <input className={inputCls} value={form.title} onChange={e => set("title", e.target.value)} required />
            </div>
            <div><label className={labelCls}>Model</label><input className={inputCls} value={form.model} onChange={e => set("model", e.target.value)} /></div>
            <div><label className={labelCls}>Year</label><input type="number" className={inputCls} value={form.year} onChange={e => set("year", e.target.value)} /></div>
            <div><label className={labelCls}>Price</label><input type="number" step="0.01" className={inputCls} value={form.price} onChange={e => set("price", e.target.value)} /></div>
            <div>
              <label className={labelCls}>Condition</label>
              <select className={inputCls} value={form.condition} onChange={e => set("condition", e.target.value)}>
                <option value="excellent">Excellent</option><option value="good">Good</option>
                <option value="fair">Fair</option><option value="parts">For Parts</option>
              </select>
            </div>
            <div><label className={labelCls}>Processor</label><input className={inputCls} value={form.processor} onChange={e => set("processor", e.target.value)} /></div>
            <div><label className={labelCls}>RAM</label><input className={inputCls} value={form.ram} onChange={e => set("ram", e.target.value)} /></div>
            <div><label className={labelCls}>Storage</label><input className={inputCls} value={form.storage} onChange={e => set("storage", e.target.value)} /></div>
            <div><label className={labelCls}>Color</label><input className={inputCls} value={form.color} onChange={e => set("color", e.target.value)} /></div>
            <div><label className={labelCls}>Battery Health (%)</label><input type="number" min={0} max={100} className={inputCls} value={form.batteryHealth} onChange={e => set("batteryHealth", e.target.value)} /></div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea rows={3} className={`${inputCls} resize-none`} value={form.description} onChange={e => set("description", e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              <Check className="w-4 h-4" />{saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Listing Card ──────────────────────────────────────────────────────────────
function ListingCard({
  listing, onEdit, onDelete, onStatusChange,
}: {
  listing: Listing;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ListingImage[]>(listing.images);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/store/${listing.id}/images`, { method: "POST", body: fd });
    if (res.ok) {
      const img = await res.json();
      setImages(prev => [...prev, img]);
    }
    setUploading(false);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(f => { if (f.type.startsWith("image/")) uploadImage(f); });
  };

  const cover = images[0]?.url;

  return (
    <>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col ${listing.status === "sold" ? "opacity-60" : ""}`}>

        {/* Cover image */}
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {cover ? (
            <button onClick={() => setLightbox(cover)} className="w-full h-full group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt={listing.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
              <ShoppingBag className="w-10 h-10 mb-2" />
              <span className="text-xs">No photos yet</span>
            </div>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              {images.length} photos
            </div>
          )}
          <div className={`absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[listing.status]}`}>
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1 mr-2">{listing.title}</h3>
            <span className="text-lg font-bold text-blue-600 shrink-0">${listing.price.toLocaleString()}</span>
          </div>

          <p className="text-xs text-gray-500 mb-3">{listing.model} · {listing.year}</p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONDITION_COLORS[listing.condition]}`}>
              {CONDITION_LABELS[listing.condition]}
            </span>
            {listing.ram && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{listing.ram} RAM</span>}
            {listing.storage && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{listing.storage}</span>}
            {listing.processor && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{listing.processor}</span>}
            {listing.color && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{listing.color}</span>}
            {listing.batteryHealth != null && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${listing.batteryHealth >= 80 ? "bg-green-100 text-green-700" : listing.batteryHealth >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                🔋 {listing.batteryHealth}%
              </span>
            )}
          </div>

          {listing.description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{listing.description}</p>
          )}

          {/* Photo thumbnails strip */}
          {images.length > 0 && (
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
              {images.map(img => (
                <button key={img.id} onClick={() => setLightbox(img.url)} className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-blue-400 transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-gray-50 space-y-2">
            {/* Photo upload */}
            <div className="flex gap-2">
              <button onClick={() => cameraRef.current?.click()} disabled={uploading}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-gray-200 rounded-lg text-xs text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors disabled:opacity-50">
                <Camera className="w-3.5 h-3.5" /> {uploading ? "Uploading…" : "Photo"}
              </button>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-gray-200 rounded-lg text-xs text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors disabled:opacity-50">
                <FolderOpen className="w-3.5 h-3.5" /> File
              </button>
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
            </div>

            {/* Status + Actions */}
            <div className="flex items-center gap-2">
              <select
                value={listing.status}
                onChange={e => onStatusChange(e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
              <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>

            <p className="text-[10px] text-gray-300 text-right">{format(new Date(listing.createdAt), "MMM d, yyyy")}</p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StorePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/store");
    if (res.ok) setListings(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (l: Listing) => { setListings(prev => [l, ...prev]); setShowNew(false); };
  const handleSaved = (l: Listing) => { setListings(prev => prev.map(x => x.id === l.id ? l : x)); setEditingId(null); };
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing permanently?")) return;
    await fetch(`/api/store/${id}`, { method: "DELETE" });
    setListings(prev => prev.filter(x => x.id !== id));
  };
  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/store/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) { const l = await res.json(); setListings(prev => prev.map(x => x.id === id ? l : x)); }
  };

  const filtered = filter === "all" ? listings : listings.filter(l => l.status === filter);
  const available = listings.filter(l => l.status === "available").length;
  const sold = listings.filter(l => l.status === "sold").length;
  const reserved = listings.filter(l => l.status === "reserved").length;
  const editingListing = editingId ? listings.find(l => l.id === editingId) : null;

  return (
    <>
      {showNew && <NewListingModal onCreated={handleCreated} onCancel={() => setShowNew(false)} />}
      {editingListing && <EditListingModal listing={editingListing} onSaved={handleSaved} onCancel={() => setEditingId(null)} />}

      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store</h1>
            <p className="text-gray-500 text-sm mt-1">Refurbished & used MacBooks for sale</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Listing
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Available", value: available, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Reserved", value: reserved, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Sold", value: sold, color: "text-gray-500", bg: "bg-gray-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {["all", "available", "reserved", "sold"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {f === "all" ? `All (${listings.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Tag className="w-12 h-12 mb-4 opacity-40" />
            <p className="font-medium text-gray-600 mb-1">{filter === "all" ? "No listings yet" : `No ${filter} listings`}</p>
            {filter === "all" && <p className="text-sm mb-4">Add your first refurbished MacBook listing</p>}
            {filter === "all" && (
              <button onClick={() => setShowNew(true)} className="text-blue-600 hover:text-blue-700 text-sm">+ Add listing</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(l => (
              <ListingCard
                key={l.id}
                listing={l}
                onEdit={() => setEditingId(l.id)}
                onDelete={() => handleDelete(l.id)}
                onStatusChange={status => handleStatusChange(l.id, status)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
