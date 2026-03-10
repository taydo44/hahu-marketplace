import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServiceForm } from "@/components/services/ServiceForm";

export const metadata = { title: "Post a Service" };

export default async function NewServicePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirectTo=/services/new");

  return (
    <div className="page-container py-10 min-h-screen">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-axum-950 mb-2">Post a Service</h1>
          <p className="text-axum-500">Share your skills with the community. Your listing will be live immediately.</p>
        </div>
        <div className="card p-6 md:p-8">
          <ServiceForm userId={user.id} />
        </div>
      </div>
    </div>
  );
}
