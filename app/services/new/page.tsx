import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServiceForm } from "@/components/services/ServiceForm";

export const metadata = { title: "Post a Service" };

export default async function NewServicePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirectTo=/services/new");

  return (
    <div className="form-page page-container">
      <div className="form-page__inner">
        <div className="page-header">
          <h1 className="page-title">Post a Service</h1>
          <p className="page-sub">Share your skills with the community. Your listing will be live immediately.</p>
        </div>
        <div className="card form-card">
          <ServiceForm userId={user.id} />
        </div>
      </div>
    </div>
  );
}
