import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/AdminDashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Amministrazione | Family Care" },
      { name: "description", content: "Pannello di controllo e pipeline dei lead di Family Care." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <div className="bg-background min-h-screen py-10">
      <AdminDashboard />
    </div>
  );
}
