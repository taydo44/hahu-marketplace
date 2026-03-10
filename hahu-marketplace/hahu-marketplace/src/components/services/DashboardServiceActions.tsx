"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Trash2, Eye, Loader2 } from "lucide-react";

export function DashboardServiceActions({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this service listing? This cannot be undone.")) return;
    setDeleting(true);
    const { error } = await supabase.from("services").delete().eq("id", serviceId);
    if (!error) {
      router.refresh();
    } else {
      alert("Failed to delete. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Link href={`/services/${serviceId}`} title="Preview"
        className="p-2 rounded-lg text-axum-400 hover:text-axum-700 hover:bg-axum-50 transition-colors">
        <Eye size={15} />
      </Link>
      <Link href={`/services/edit/${serviceId}`} title="Edit"
        className="p-2 rounded-lg text-axum-400 hover:text-teff-600 hover:bg-teff-50 transition-colors">
        <Pencil size={15} />
      </Link>
      <button onClick={handleDelete} disabled={deleting} title="Delete"
        className="p-2 rounded-lg text-axum-400 hover:text-harar-600 hover:bg-harar-50 transition-colors disabled:opacity-40">
        {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
    </div>
  );
}
