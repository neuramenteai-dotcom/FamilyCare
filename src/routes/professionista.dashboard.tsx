import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getProDashboard, setProInterest } from "@/functions/dashboard.functions";
import { useServerFn } from "@tanstack/react-start";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Loader2, ThumbsUp, ThumbsDown, FileText, ShieldAlert, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/professionista/dashboard")({
  component: ProDashboard,
});

function ProDashboard() {
  const navigate = useNavigate();
  const fetchDashboard = useServerFn(getProDashboard);
  const setInterestFn = useServerFn(setProInterest);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: authSession } = await supabase.auth.getSession();
      if (!authSession.session) {
        navigate({ to: "/login" });
        return;
      }

      const res = await fetchDashboard();
      if (res.success) {
        if (res.locked && (res.status === "nuovo" || res.status === "contattato")) {
          navigate({ to: "/verifica-identita/$id", params: { id: res.proId } });
          return;
        }
        setData(res);
      } else {
        toast.error(res.error);
      }
      setLoading(false);
    }
    load();
  }, [navigate, fetchDashboard]);

  async function handleAction(familyId: string, status: "like" | "dislike") {
    setActing(familyId);
    try {
      const res = await setInterestFn({
        data: {
          familyId,
          status,
        },
      });
      if (res.success) {
        // Update local state to hide the card or show it as acted
        setData((prev: any) => ({
          ...prev,
          interests: [...prev.interests, { family_id: familyId, status }],
        }));
        toast.success(status === "like" ? "Interesse inviato con successo!" : "Richiesta scartata");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Errore di connessione");
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20">
        <h2 className="text-2xl font-bold mb-4">Profilo non trovato</h2>
        <p className="text-muted-foreground mb-6">Assicurati di aver completato l'iscrizione.</p>
        <Button onClick={() => navigate({ to: "/" })}>Torna alla Home</Button>
      </div>
    );
  }

  // Filter out families we already acted upon
  const actedFamilyIds = new Set(data.interests?.map((i: any) => i.family_id));
  const availableFamilies = data.families?.filter((f: any) => !actedFamilyIds.has(f.id)) || [];

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-background border-b border-border/40 sticky top-0 z-10 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
          {data?.full_name && (
            <span className="hidden sm:inline-block font-medium text-foreground ml-2">
              Ciao, {data.full_name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="hidden sm:flex"
            onClick={() => navigate({ to: "/professionista/profilo" })}
          >
            Profilo
          </Button>
          <Button
            variant="outline"
            className="hidden sm:flex"
            onClick={() => navigate({ to: "/verifica-identita/$id", params: { id: data?.proId } })}
          >
            <FileText className="w-4 h-4 mr-2" />I miei Documenti
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              supabase.auth.signOut();
              navigate({ to: "/" });
            }}
          >
            Esci
          </Button>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto py-8 px-4">
        {data?.locked ? (
          <div className="bg-background p-8 rounded-3xl border border-border/60 text-center shadow-sm max-w-2xl mx-auto mt-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-semibold mb-4">Profilo in Verifica</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {data?.status === "nuovo" || data?.status === "contattato"
                ? "Devi caricare un documento d'identità per procedere. Senza un documento verificato non potrai accedere alla bacheca degli annunci."
                : "Abbiamo ricevuto i tuoi documenti. Il nostro team sta revisionando il tuo profilo manualmente per garantirti l'accesso alla bacheca."}
            </p>
            <Button
              size="lg"
              className="rounded-xl h-14 px-8 text-base shadow-soft"
              onClick={() =>
                navigate({ to: "/verifica-identita/$id", params: { id: data?.proId } })
              }
            >
              Vai alla pagina di Verifica Documenti
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-3xl font-semibold">Bacheca Lavoro</h1>
              <Button
                variant="outline"
                className="sm:hidden w-full"
                onClick={() =>
                  navigate({ to: "/verifica-identita/$id", params: { id: data?.proId } })
                }
              >
                <FileText className="w-4 h-4 mr-2" />I miei Documenti
              </Button>
            </div>

            <div className="max-w-lg mx-auto">
              {availableFamilies.length > 0 ? (
                (() => {
                  const fam = availableFamilies[0];
                  return (
                    <div
                      key={fam.id}
                      className="bg-background rounded-3xl border border-border/60 p-8 shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 min-h-[400px]"
                    >
                      <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-bl-lg">
                        NUOVA RICHIESTA
                      </div>
                      <div className="flex items-center gap-4 mb-6 mt-2">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl">
                          📍
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl">Famiglia a {fam.city}</h3>
                          <p className="text-sm text-muted-foreground font-medium text-red-500">
                            {fam.urgency}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 text-sm flex-grow mb-8 bg-muted/30 p-6 rounded-2xl">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                            Servizio Richiesto
                          </span>
                          <span className="text-base">{(fam.services || []).join(", ")}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                            Frequenza
                          </span>
                          <span className="text-base">{fam.frequency || "Non specificata"}</span>
                        </div>
                        {fam.message && (
                          <div className="flex flex-col gap-1 mt-2">
                            <span className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                              Messaggio
                            </span>
                            <p className="text-foreground italic bg-background p-3 rounded-xl border border-border/50">
                              "{fam.message}"
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 mt-auto">
                        <Button
                          variant="outline"
                          size="lg"
                          className="flex-1 rounded-2xl h-14 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => handleAction(fam.id, "dislike")}
                          disabled={acting === fam.id}
                        >
                          <ThumbsDown className="w-5 h-5 mr-2" />
                          Scarta
                        </Button>
                        <Button
                          size="lg"
                          className="flex-1 rounded-2xl h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft"
                          onClick={() => handleAction(fam.id, "like")}
                          disabled={acting === fam.id}
                        >
                          <ThumbsUp className="w-5 h-5 mr-2" />
                          Mi Interessa
                        </Button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="col-span-full bg-background p-10 rounded-3xl border border-border/60 text-center">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    🌟
                  </div>
                  <h2 className="text-2xl font-semibold mb-3">Hai visto tutto!</h2>
                  <p className="text-muted-foreground text-lg">
                    Non ci sono nuove richieste nella tua zona. Ti avviseremo appena una famiglia
                    cercherà un professionista come te.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
