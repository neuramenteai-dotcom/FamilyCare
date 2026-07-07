import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/AdminDashboard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // UX guard: l'enforcement vero è nel middleware requireAdmin lato server
      if (!session) {
        navigate({ to: "/login" });
      } else if (session.user.app_metadata?.role !== "admin") {
        navigate({ to: "/" });
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkSession();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        Caricamento...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="bg-background min-h-screen py-10">
      <AdminDashboard />
    </div>
  );
}
