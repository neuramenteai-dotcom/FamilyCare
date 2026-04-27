import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle, MapPin, Loader2, Check } from "lucide-react";
import { joinWaitlist } from "@/server/waitlist.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/contatti")({
  head: () => ({
    meta: [
      { title: "Contatti — Parla con il team Family Care" },
      {
        name: "description",
        content:
          "Hai una domanda, una segnalazione o vuoi collaborare? Scrivici. Rispondiamo entro 24 ore lavorative.",
      },
      { property: "og:title", content: "Contatta Family Care" },
      {
        property: "og:description",
        content: "Siamo qui per aiutarti. Scrivici e ti rispondiamo entro 24 ore.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const send = useServerFn(joinWaitlist);
  const [form, setForm] = useState({ full_name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await send({
        data: {
          email: form.email,
          full_name: form.full_name,
          message: form.message,
          source: "contact",
          userType: "famiglia",
        },
      });
      if (res.success) {
        setDone(true);
        toast.success("Messaggio inviato! Ti rispondiamo entro 24h.");
      } else {
        toast.error(res.error || "Errore");
      }
    } catch {
      toast.error("Errore di connessione");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section className="bg-gradient-hero pt-20">
      <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
        <div>
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3">
            Contatti
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05]">
            Parliamone.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Domande, segnalazioni, partnership: scrivici e ti rispondiamo
            entro 24 ore lavorative.
          </p>

          <div className="mt-10 space-y-5">
            {[
              { icon: Mail, t: "Email", d: "ciao@familycare.it" },
              { icon: MessageCircle, t: "Chat", d: "Lun–Ven · 8:00–22:00" },
              { icon: MapPin, t: "Sede", d: "Via Tortona 32, 20144 Milano" },
            ].map((it) => (
              <div key={it.t} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary-soft text-primary grid place-items-center">
                  <it.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{it.t}</p>
                  <p className="font-semibold">{it.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-soft border border-border">
          {done ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 grid place-items-center rounded-full bg-primary text-primary-foreground mb-4">
                <Check className="h-8 w-8" strokeWidth={3} />
              </div>
              <p className="font-display text-2xl font-semibold">Grazie!</p>
              <p className="text-muted-foreground mt-2">
                Abbiamo ricevuto il tuo messaggio.<br />
                Ti rispondiamo entro 24 ore.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome e cognome</Label>
                <Input
                  id="name"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="message">Messaggio</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-1.5 rounded-xl resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Invia messaggio"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}
