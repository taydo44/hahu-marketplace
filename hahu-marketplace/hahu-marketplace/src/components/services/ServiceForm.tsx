"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, US_CITIES_EA_DIASPORA, type Service } from "@/types";
import { Loader2, AlertCircle } from "lucide-react";

interface ServiceFormProps {
  service?: Service;
  userId: string;
}

export function ServiceForm({ service, userId }: ServiceFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!service;

  const [form, setForm] = useState({
    title: service?.title ?? "",
    description: service?.description ?? "",
    price: service?.price?.toString() ?? "",
    price_type: service?.price_type ?? "hourly",
    category: service?.category ?? "",
    city: service?.city ?? "",
    contact_email: service?.contact_email ?? "",
    contact_phone: service?.contact_phone ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(form.description.length);

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, [field]: val }));
    if (field === "description") setCharCount(val.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!form.category) { setError("Please select a category."); setLoading(false); return; }
    if (!form.city)     { setError("Please select your city.");  setLoading(false); return; }

    const payload = {
      provider_id: userId,
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.price_type === "negotiable" ? 0 : parseFloat(form.price) || 0,
      price_type: form.price_type,
      category: form.category,
      city: form.city,
      contact_email: form.contact_email.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      is_active: true,
    };

    const { error: dbError } = isEdit
      ? await supabase.from("services").update(payload).eq("id", service.id).eq("provider_id", userId)
      : await supabase.from("services").insert(payload);

    if (dbError) { setError(dbError.message); setLoading(false); return; }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2.5 bg-harar-50 border border-harar-200 text-harar-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="field-label">Service Title *</label>
        <input type="text" required value={form.title} onChange={set("title")}
          placeholder="e.g. Professional Home Cleaning Service" className="field" maxLength={120} />
        <p className="field-hint">Be specific — good titles get more clicks</p>
      </div>

      <div>
        <label className="field-label">Description *</label>
        <textarea required value={form.description} onChange={set("description")}
          placeholder="Describe what you offer, your experience, and what clients can expect..."
          className="field min-h-[140px] resize-y" maxLength={1200} />
        <p className="field-hint">{charCount}/1200 characters</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Price ($)</label>
          <input type="number" min="0" step="1" value={form.price} onChange={set("price")}
            placeholder="0" className="field" disabled={form.price_type === "negotiable"}
            required={form.price_type !== "negotiable"} />
        </div>
        <div>
          <label className="field-label">Pricing Type</label>
          <select value={form.price_type} onChange={set("price_type")} className="field">
            <option value="hourly">Per Hour</option>
            <option value="fixed">Fixed Price</option>
            <option value="negotiable">Negotiable</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Category *</label>
          <select required value={form.category} onChange={set("category")} className="field">
            <option value="">Select category...</option>
            {CATEGORIES.map(({ value, label, emoji }) => (
              <option key={value} value={value}>{emoji} {label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">City *</label>
          <select required value={form.city} onChange={set("city")} className="field">
            <option value="">Select city...</option>
            {US_CITIES_EA_DIASPORA.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <p className="field-label">Contact Information</p>
        <p className="field-hint mb-3">Provide at least one way for clients to reach you</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label text-axum-500">Email</label>
            <input type="email" value={form.contact_email} onChange={set("contact_email")}
              placeholder="you@example.com" className="field" />
          </div>
          <div>
            <label className="field-label text-axum-500">Phone</label>
            <input type="tel" value={form.contact_phone} onChange={set("contact_phone")}
              placeholder="+1 (555) 000-0000" className="field" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="btn btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn btn-primary flex-1">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Save Changes" : "Post Service"}
        </button>
      </div>
    </form>
  );
}
