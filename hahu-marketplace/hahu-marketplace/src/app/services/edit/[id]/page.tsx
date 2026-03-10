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
    <div className="page-container py-10 min-h-screen">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-axum-950 mb-2">Edit Service</h1>
          <p className="text-axum-500">Update your listing details.</p>
        </div>
        <div className="card p-6 md:p-8">
          <ServiceForm service={service} userId={user.id} />
        </div>
      </div>
    </div>
  );
}
