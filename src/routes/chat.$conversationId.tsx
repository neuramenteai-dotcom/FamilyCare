import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMessages, sendMessage } from "@/functions/chat.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/chat/$conversationId")({
  component: ChatPage,
});

type Message = { id: string; sender_auth_id: string; body: string; created_at: string };

function ChatPage() {
  const { conversationId } = Route.useParams();
  const navigate = useNavigate();
  const loadMessages = useServerFn(getMessages);
  const send = useServerFn(sendMessage);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myAuthId, setMyAuthId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function appendUnique(msg: Message) {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate({ to: "/login" });
        return;
      }
      const res = await loadMessages({ data: { conversationId } });
      if (cancelled) return;
      if (!res.success) {
        toast.error(res.error || "Conversazione non accessibile");
        navigate({ to: "/messaggi" });
        return;
      }
      setMessages(res.messages as Message[]);
      setMyAuthId(res.myAuthId);
      setLoading(false);
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [conversationId, loadMessages, navigate]);

  // Realtime: nuovi messaggi della conversazione (filtrati da RLS)
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => appendUnique(payload.new as Message),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setText("");
    try {
      const res = await send({ data: { conversationId, body } });
      if (res.success && res.message) {
        appendUnique(res.message as Message);
      } else {
        toast.error(res.error || "Invio non riuscito");
        setText(body);
      }
    } catch {
      toast.error("Errore di connessione");
      setText(body);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/messaggi" })}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-display text-xl font-semibold">Conversazione</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nessun messaggio. Scrivi per iniziare la conversazione.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_auth_id === myAuthId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border/60"
                  }`}
                >
                  <span className="whitespace-pre-wrap break-words">{m.body}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Scrivi un messaggio…"
          className="h-11 rounded-xl"
          maxLength={2000}
        />
        <Button
          type="submit"
          disabled={sending || !text.trim()}
          className="h-11 w-11 rounded-xl p-0 shrink-0"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </Button>
      </form>
    </div>
  );
}
