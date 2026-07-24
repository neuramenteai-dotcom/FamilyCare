import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyDocuments, uploadProfessionalDocument } from "@/functions/verification.functions";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, UploadCloud, ShieldCheck, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/professionista/verifica-documenti")({
  component: VerificaDocumenti,
});

type DocType = "casellario" | "referenza" | "attestato";

const DOCS: { type: DocType; title: string; desc: string }[] = [
  {
    type: "casellario",
    title: "Casellario giudiziale",
    desc: "Certificato del casellario giudiziale aggiornato.",
  },
  {
    type: "referenza",
    title: "Lettera di referenza",
    desc: "Una referenza da un precedente datore di lavoro.",
  },
  {
    type: "attestato",
    title: "Attestato formativo",
    desc: "Attestati o certificazioni professionali (es. primo soccorso, OSS).",
  },
];

type Doc = { id: string; doc_type: string; status: string; created_at: string };

function VerificaDocumenti() {
  const navigate = useNavigate();
  const fetchDocs = useServerFn(getMyDocuments);
  const uploadDoc = useServerFn(uploadProfessionalDocument);

  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [badges, setBadges] = useState<Record<DocType, boolean>>({
    casellario: false,
    referenza: false,
    attestato: false,
  });
  const [uploading, setUploading] = useState<DocType | null>(null);

  const load = useCallback(async () => {
    const res = await fetchDocs();
    if (res.success) {
      setDocuments((res.documents as Doc[]) || []);
      if (res.badges) setBadges(res.badges as Record<DocType, boolean>);
    }
    setLoading(false);
  }, [fetchDocs]);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/login" });
        return;
      }
      await load();
    }
    init();
  }, [navigate, load]);

  async function handleUpload(type: DocType, file: File) {
    setUploading(type);
    try {
      const formData = new FormData();
      formData.append("docType", type);
      formData.append("file", file);
      const res = await uploadDoc({ data: formData });
      if (res.success) {
        toast.success("Documento inviato per la verifica.");
        await load();
      } else {
        toast.error(res.error || "Caricamento non riuscito.");
      }
    } catch {
      toast.error("Errore di rete.");
    } finally {
      setUploading(null);
    }
  }

  function latestFor(type: DocType): Doc | undefined {
    return documents.find((d) => d.doc_type === type);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      <header className="bg-background border-b border-border/40 sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/professionista/dashboard" })}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo />
        </div>
      </header>

      <main className="container max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-semibold mb-2">Verifica approfondita</h1>
        <p className="text-muted-foreground mb-8">
          Carica questi documenti per ottenere i badge di verifica. Le famiglie vedranno solo il
          badge <strong>"Verificato"</strong>, mai il documento. I file sono conservati in modo
          sicuro e riservato.
        </p>

        <div className="space-y-4">
          {DOCS.map((doc) => {
            const latest = latestFor(doc.type);
            const verified = badges[doc.type];
            return (
              <div
                key={doc.type}
                className="bg-background rounded-2xl border border-border/60 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground">{doc.desc}</p>
                  </div>
                  <StatusPill verified={verified} status={latest?.status} />
                </div>

                <div className="mt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-primary hover:underline">
                    {uploading === doc.type ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    {latest ? "Carica un nuovo file" : "Carica documento"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      disabled={uploading !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(doc.type, f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function StatusPill({ verified, status }: { verified: boolean; status?: string }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-medium whitespace-nowrap">
        <ShieldCheck className="w-3.5 h-3.5" /> Verificato
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 px-3 py-1 text-xs font-medium whitespace-nowrap">
        <XCircle className="w-3.5 h-3.5" /> Rifiutato
      </span>
    );
  }
  if (status === "pending" || status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-medium whitespace-nowrap">
        <Clock className="w-3.5 h-3.5" /> In verifica
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-3 py-1 text-xs font-medium whitespace-nowrap">
      Non caricato
    </span>
  );
}
