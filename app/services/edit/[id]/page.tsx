import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServiceForm } from "@/components/services/ServiceForm";

export const metadata = { title: "Edit Service" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: service } = await supabase
    .from("services").select("*").eq("id", id).eq("provider_id", user.id).single();

  if (!service) notFound();

  return (
    <div className="form-page page-container">
      <div className="form-page__inner">
        <div className="page-header">
          <h1 className="page-title">Edit Service</h1>
          <p className="page-sub">Update your listing details.</p>
        </div>
        <div className="card form-card">
          <ServiceForm service={service} userId={user.id} />
        </div>
      </div>
    </div>
  );
}
