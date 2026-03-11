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
    <div className="dash__act-btns">
      <Link href={`/services/${serviceId}`} title="Preview" className="dash__act-btn dash__act-btn--view">
        <Eye size={15} />
      </Link>
      <Link href={`/services/edit/${serviceId}`} title="Edit" className="dash__act-btn dash__act-btn--edit">
        <Pencil size={15} />
      </Link>
      <button onClick={handleDelete} disabled={deleting} title="Delete" className="dash__act-btn dash__act-btn--del">
        {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
    </div>
  );
}
