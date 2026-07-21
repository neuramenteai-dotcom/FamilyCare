import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getConversations } from "@/functions/chat.functions";
import { Loader2, MessageCircle, UserRound, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/messaggi")({
  component: MessaggiPage,
});

type Conversation = {
  id: string;
  otherName: string;
  otherAvatar: string | null;
  created_at: string;
};

function MessaggiPage() {
  const navigate = useNavigate();
  const fetchConversations = useServerFn(getConversations);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate({ to: "/login" });
        return;
      }
      const res = await fetchConversations();
      if (cancelled) return;
      if (res.success) {
        setConversations(res.conversations as Conversation[]);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [navigate, fetchConversations]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold mb-6">I tuoi messaggi</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageCircle className="w-10 h-10 mx-auto opacity-40 mb-3" />
          <p>Nessuna conversazione. Contatta un profilo per iniziare a chattare.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              to="/chat/$conversationId"
              params={{ conversationId: c.id }}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="w-11 h-11 rounded-full overflow-hidden bg-muted grid place-items-center shrink-0">
                {c.otherAvatar ? (
                  <img src={c.otherAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserRound className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <span className="font-medium flex-1">{c.otherName}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
