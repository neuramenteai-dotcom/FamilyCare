import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  createStripeIdentitySession,
  checkStripeIdentitySession,
  getIdentityVerificationStatus,
} from "@/functions/identity.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CheckCircle,
  Loader2,
  Lock,
  Globe2,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/verifica-identita/$id")({
  component: IdentityVerificationPage,
});

// Qui c'era l'elenco dei gestori SPID, mostrato da un flusso che non
// autenticava niente. Rimesso solo quando ci sara' un'integrazione vera.

function IdentityVerificationPage() {
  const navigate = useNavigate();

  const createStripeSession = useServerFn(createStripeIdentitySession);
  const checkStripeSession = useServerFn(checkStripeIdentitySession);
  const fetchStatus = useServerFn(getIdentityVerificationStatus);

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isVerifyingStripe, setIsVerifyingStripe] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState<any>(null);

  // Inizializzazione e controllo sessione di ritorno
  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/login" });
        return;
      }

      const sessionId = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("session_id")
        : null;

      // 1. Se stiamo tornando da un redirect Stripe con ?session_id=...
      // Non si esce da qui con un messaggio proprio: l'esito va riletto dal
      // profilo, perche' la verifica del documento non pubblica il profilo e
      // solo lo stato sul record dice se e' visibile alle famiglie.
      if (sessionId) {
        setIsVerifyingStripe(true);
        try {
          const checkRes = await checkStripeSession({
            data: { sessionId },
          });
          if (checkRes.success && checkRes.verified) {
            toast.success("Documento e selfie confermati.");
          }
        } catch (e) {
          console.error("Errore verifica sessione Stripe al ritorno:", e);
        }
        setIsVerifyingStripe(false);
      }

      // 2. Controllo dello stato del profilo
      try {
        const res = await fetchStatus();
        if (res.success) {
          setUserData(res);
          if (res.verified) {
            const pubblicato = res.status === "attivo";
            setVerifiedSuccess({
              method: res.method || "manual",
              date: res.verifiedAt,
              pubblicato,
              message: pubblicato
                ? "La tua identità è verificata e il tuo profilo è visibile alle famiglie."
                : "La tua identità è verificata. Ora una persona del nostro team guarda il profilo prima di pubblicarlo: ti scriviamo per email quando è online.",
            });
          }
        }
      } catch (err) {
        console.error("Errore recupero stato:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [navigate, fetchStatus, checkStripeSession]);

  // Avvio flusso Stripe Identity
  const handleStartStripe = async () => {
    setIsVerifyingStripe(true);
    try {
      const returnUrl = window.location.origin + window.location.pathname;
      const res = await createStripeSession({
        data: { returnUrl },
      });

      if (res.success && res.url) {
        // Reindirizza al portale hosted sicuro di Stripe
        window.location.href = res.url;
      } else {
        toast.error(res.error || "Impossibile avviare Stripe Identity.");
        setIsVerifyingStripe(false);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Errore di connessione a Stripe Identity.");
      setIsVerifyingStripe(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Caricamento stato di verifica...</p>
      </div>
    );
  }

  // Schermata di successo
  if (verifiedSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Identità verificata
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {verifiedSuccess.pubblicato ? "Il tuo profilo è online" : "Identità verificata"}
          </h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            {verifiedSuccess.message}
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 text-left mb-8 border border-gray-100 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Metodo:</span>
              <span className="font-semibold text-gray-800">
                {verifiedSuccess.method === "stripe_identity"
                  ? "Stripe Identity (documento e selfie)"
                  : "Controllo manuale del nostro team"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Documenti salvati da noi:</span>
              <span className="font-semibold text-gray-800">Nessuno</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Profilo visibile alle famiglie:</span>
              <span className="font-semibold text-gray-800">
                {verifiedSuccess.pubblicato ? "Sì" : "In attesa di pubblicazione"}
              </span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full rounded-2xl h-14 text-base shadow-md font-semibold"
            onClick={() => navigate({ to: "/professionista/dashboard" })}
          >
            Vai alla Bacheca Lavoro
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        {/* Intestazione */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-4">
            <Lock className="w-3.5 h-3.5" />
            Protezione Privacy & Sicurezza
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Verifica la tua Identità
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Per tutelare le famiglie verifichiamo che ogni profilo sia autentico.
            <br />
            <strong className="text-gray-800">Non memorizziamo foto dei tuoi documenti sui nostri server:</strong> l'identità viene certificata tramite partner sicuri ed esterni.
          </p>
        </div>

        {/* Un solo canale di verifica: Stripe Identity */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-purple-100 shadow-sm flex flex-col justify-between relative overflow-hidden">

            <div>
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Globe2 className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Stripe Identity
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Carta d'identità, passaporto o patente, italiani o stranieri. La verifica avviene
                sulle pagine di Stripe, non sulle nostre.
              </p>

              <ul className="space-y-2.5 text-xs text-gray-600 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Documenti italiani ed esteri
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Foto del documento e selfie, confrontati da Stripe
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Le immagini restano a Stripe, non passano dai nostri server
                </li>
              </ul>

              <p className="text-xs text-gray-500 mb-8 leading-relaxed">
                Quando la verifica è andata a buon fine, una persona del nostro team guarda il
                profilo prima di pubblicarlo.
              </p>
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                disabled={isVerifyingStripe}
                className="w-full bg-[#635bff] hover:bg-[#534acb] text-white rounded-xl h-12 font-medium"
                onClick={handleStartStripe}
              >
                {isVerifyingStripe ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Collegamento a Stripe...
                  </>
                ) : (
                  <>
                    Verifica con Stripe Identity
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Garanzia Privacy */}
        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-gray-400 shrink-0" />
          <span>
            Nessun documento viene salvato nei database della nostra applicazione. I dati anagrafici sono gestiti nel pieno rispetto del GDPR (Regolamento UE 2016/679).
          </span>
        </div>
      </div>
    </div>
  );
}
