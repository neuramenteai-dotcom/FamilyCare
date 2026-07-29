import { useState, useEffect, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  getWaitlist,
  updateWaitlistStatus,
  updateFamilyPackage,
  getIdentityDocUrl,
} from "@/functions/waitlist.functions";
import {
  getProfessionalDocuments,
  reviewProfessionalDocument,
} from "@/functions/verification.functions";
import {
  getConciergeData,
  addConciergeSelection,
  removeConciergeSelection,
  setPresented,
} from "@/functions/concierge.functions";
import { toast } from "sonner";
import {
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Search,
  Filter,
  Eye,
  Star,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Check,
  X,
  Sparkles,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lead {
  id: string;
  email: string;
  full_name: string | null;
  user_type: string;
  city: string | null;
  message: string | null;
  phone: string | null;
  services: string[] | null;
  frequency: string | null;
  urgency: string | null;
  experience: string | null;
  italian_level: string | null;
  nationality: string | null;
  birth_date: string | null;
  created_at: string;
  status: string;
  score: number | null;
  has_active_package: boolean | null;
}

export function AdminDashboard() {
  const fetchLeads = useServerFn(getWaitlist);
  const updateStatus = useServerFn(updateWaitlistStatus);
  const updatePackage = useServerFn(updateFamilyPackage);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "famiglia" | "professionista">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Load leads
  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchLeads();
      if (res.success && res.data) {
        setLeads(res.data as Lead[]);
      } else {
        toast.error(res.error || "Impossibile caricare i lead.");
      }
    } catch {
      toast.error("Errore di connessione al database.");
    } finally {
      setLoading(false);
    }
  }, [fetchLeads]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleStatusChange = async (
    id: string,
    newStatus: "nuovo" | "contattato" | "in_verifica" | "pre_approvato" | "attivo",
  ) => {
    try {
      const res = await updateStatus({ data: { id, status: newStatus } });
      if (res.success) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead)),
        );
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        toast.success(`Stato aggiornato a ${newStatus}`);
      } else {
        toast.error(res.error || "Impossibile aggiornare lo stato.");
      }
    } catch {
      toast.error("Errore durante l'aggiornamento.");
    }
  };

  const handlePackageToggle = async (id: string, currentVal: boolean) => {
    try {
      const res = await updatePackage({ data: { id, has_active_package: !currentVal } });
      if (res.success) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === id ? { ...lead, has_active_package: !currentVal } : lead,
          ),
        );
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead((prev) => (prev ? { ...prev, has_active_package: !currentVal } : null));
        }
        toast.success(
          !currentVal ? "Pacchetto Famiglia attivato!" : "Pacchetto Famiglia disattivato.",
        );
      } else {
        toast.error(res.error || "Impossibile aggiornare pacchetto.");
      }
    } catch {
      toast.error("Errore durante l'aggiornamento.");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      (lead.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phone || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || lead.user_type === filterType;
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getScoreBadgeClass = (score: number | null) => {
    const val = score || 0;
    if (val >= 80)
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400";
    if (val >= 50)
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "attivo":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_verifica":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" /> In Verifica
          </span>
        );
      case "pre_approvato":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <ShieldAlert className="w-3 h-3 mr-1" /> Pre-Approvato (AI)
          </span>
        );
      default:
        return <ShieldAlert className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Header Stat Cards */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Pipeline Leads & Candidati
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestisci le registrazioni delle famiglie e delle candidate collaboratrici domestiche in
            tempo reale.
          </p>
        </div>
        <Button
          onClick={loadLeads}
          disabled={loading}
          variant="outline"
          className="h-10 rounded-xl"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
          Aggiorna dati
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Leads Totali
          </span>
          <span className="block text-3xl font-bold font-display mt-2 text-foreground">
            {leads.length}
          </span>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Famiglie
          </span>
          <span className="block text-3xl font-bold font-display mt-2 text-primary">
            {leads.filter((l) => l.user_type === "famiglia").length}
          </span>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Professionisti
          </span>
          <span className="block text-3xl font-bold font-display mt-2 text-accent">
            {leads.filter((l) => l.user_type === "professionista").length}
          </span>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Da Contattare
          </span>
          <span className="block text-3xl font-bold font-display mt-2 text-rose-500">
            {leads.filter((l) => l.status === "nuovo").length}
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Table list */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls bar */}
          <div className="bg-card border border-border p-4 rounded-2xl grid md:grid-cols-12 gap-3 items-center shadow-soft">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cerca per nome, email o telefono..."
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/50"
              />
            </div>
            <div className="md:col-span-4 flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                value={filterType}
                onChange={(e: any) => setFilterType(e.target.value)}
                className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm outline-none cursor-pointer"
              >
                <option value="all">Tutti i tipi</option>
                <option value="famiglia">Famiglia (Cerco aiuto)</option>
                <option value="professionista">Professionista (Lavoro)</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm outline-none cursor-pointer"
              >
                <option value="all">Tutti gli stati</option>
                <option value="nuovo">Nuovo</option>
                <option value="contattato">Contattato</option>
                <option value="in_verifica">In Verifica</option>
                <option value="pre_approvato">Pre-Approvato (AI)</option>
                <option value="attivo">Attivo</option>
              </select>
            </div>
          </div>

          {/* List Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span>Caricamento dei lead dal database...</span>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                Nessun lead trovato corrispondente ai filtri impostati.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="p-4">Nominativo</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Città / Zona</th>
                      <th className="p-4 text-center">Score</th>
                      <th className="p-4">Stato</th>
                      <th className="p-4 text-center">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => {
                      const scoreStars = Math.round((lead.score || 0) / 20);
                      return (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className={`border-b border-border/60 hover:bg-muted/30 cursor-pointer transition-colors ${
                            selectedLead?.id === lead.id ? "bg-primary-soft/30" : ""
                          }`}
                        >
                          <td className="p-4">
                            <div className="font-semibold text-sm text-foreground">
                              {lead.full_name || "Senza Nome"}
                            </div>
                            <div className="text-xs text-muted-foreground">{lead.email}</div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                lead.user_type === "famiglia"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                              }`}
                            >
                              {lead.user_type === "famiglia" ? "Famiglia" : "Pro"}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground max-w-[150px] truncate">
                            {lead.city || "N/A"}
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center gap-1">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${getScoreBadgeClass(lead.score)}`}
                              >
                                {lead.score}%
                              </span>
                              <div className="hidden sm:flex text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < scoreStars ? "fill-current" : "opacity-20"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground capitalize">
                              {getStatusIcon(lead.status)}
                              {lead.status}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Detailed side panel */}
        <div className="lg:col-span-4">
          {selectedLead ? (
            <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-6 sticky top-24">
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Dettaglio Profilo
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Registrato il {new Date(selectedLead.created_at).toLocaleString("it-IT")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${getScoreBadgeClass(
                      selectedLead.score,
                    )}`}
                  >
                    {selectedLead.user_type === "professionista" &&
                    (selectedLead as any).id_front_url
                      ? `AI Verifica: ${selectedLead.score}%`
                      : `Score Profilo: ${selectedLead.score}%`}
                  </span>

                  {selectedLead.user_type === "famiglia" && (
                    <button
                      onClick={() =>
                        handlePackageToggle(selectedLead.id, !!selectedLead.has_active_package)
                      }
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                        selectedLead.has_active_package
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      <CreditCard className="w-3 h-3" />
                      {selectedLead.has_active_package
                        ? "Pacchetto Attivo (Pagato)"
                        : "Nessun Pacchetto"}
                    </button>
                  )}
                </div>
              </div>

              {/* Contact info list */}
              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Nome completo
                  </span>
                  <div className="font-medium text-foreground">
                    {selectedLead.full_name || "N/A"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-primary" /> Telefono
                    </span>
                    <div>
                      {selectedLead.phone ? (
                        <a
                          href={`tel:${selectedLead.phone}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {selectedLead.phone}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-primary" /> Email
                    </span>
                    <div className="truncate">
                      {selectedLead.email ? (
                        <a
                          href={`mailto:${selectedLead.email}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {selectedLead.email}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> Città/Zona
                    </span>
                    <div className="text-foreground">{selectedLead.city || "N/A"}</div>
                  </div>
                  {selectedLead.user_type === "professionista" && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary" /> Data Nascita
                      </span>
                      <div className="text-foreground">{selectedLead.birth_date || "N/A"}</div>
                    </div>
                  )}
                </div>

                {selectedLead.user_type === "professionista" && (
                  <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-3">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Nazionalità
                      </span>
                      <div className="text-foreground">{selectedLead.nationality || "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Esperienza
                      </span>
                      <div className="text-foreground">{selectedLead.experience || "N/A"}</div>
                    </div>
                  </div>
                )}

                {selectedLead.user_type === "professionista" && (
                  <div className="space-y-1 border-t border-border/60 pt-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Lingua Italiana
                    </span>
                    <div className="text-foreground">{selectedLead.italian_level || "N/A"}</div>
                  </div>
                )}

                <div className="space-y-1.5 border-t border-border/60 pt-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Servizi Richiesti/Offerti
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLead.services && selectedLead.services.length > 0 ? (
                      selectedLead.services.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-muted border border-border text-xs rounded font-medium text-foreground"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Nessun servizio specificato
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-border/60 pt-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Presentazione / Messaggio
                  </span>
                  <div className="p-3 bg-muted rounded-xl text-xs text-foreground whitespace-pre-wrap max-h-[160px] overflow-y-auto leading-relaxed border border-border/60">
                    {selectedLead.message || "Nessun dettaglio aggiuntivo."}
                  </div>
                </div>

                {(selectedLead as any).id_front_url && (
                  <IdentityDocViewer docRef={(selectedLead as any).id_front_url} />
                )}

                {selectedLead.user_type === "professionista" && (
                  <ProVerificationPanel professionalId={selectedLead.id} />
                )}

                {selectedLead.user_type === "famiglia" && (
                  <ConciergeAdminPanel
                    familyId={selectedLead.id}
                    planTier={(selectedLead as any).plan_tier}
                  />
                )}
              </div>

              {/* Status Update section */}
              <div className="border-t border-border pt-4 space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Modifica Stato Pipeline
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(["nuovo", "contattato", "in_verifica", "pre_approvato", "attivo"] as const).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedLead.id, st)}
                        className={`h-9 rounded-xl text-xs font-semibold capitalize border transition-all ${
                          selectedLead.status === st
                            ? "bg-primary text-primary-foreground border-primary shadow-soft"
                            : "bg-background border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {st}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border border-dashed p-10 rounded-2xl text-center text-muted-foreground sticky top-24">
              <Eye className="h-8 w-8 mx-auto opacity-40 mb-3" />
              Seleziona un lead dalla tabella per visualizzare il profilo dettagliato e gestirne la
              pipeline amministrativa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Il bucket identity_docs è privato: il documento si apre tramite signed URL
// generato on-demand dal server (solo admin). Supporta sia i nuovi record
// (path) sia i vecchi (URL completo, da cui viene estratto il path).
function IdentityDocViewer({ docRef }: { docRef: string }) {
  const fetchDocUrl = useServerFn(getIdentityDocUrl);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const path = docRef.includes("/identity_docs/") ? docRef.split("/identity_docs/")[1] : docRef;

  const handleLoad = async () => {
    setLoading(true);
    try {
      const res = await fetchDocUrl({ data: { path } });
      if (res.success && res.url) {
        setSignedUrl(res.url);
      } else {
        toast.error(res.error || "Impossibile caricare il documento.");
      }
    } catch {
      toast.error("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1.5 border-t border-border/60 pt-3">
      <span className="text-xs font-semibold text-muted-foreground uppercase">
        Documento d'Identità Caricato
      </span>
      <div className="mt-2">
        {signedUrl ? (
          <a
            href={signedUrl}
            target="_blank"
            rel="noreferrer"
            className="block w-full overflow-hidden rounded-xl border border-border/60 hover:opacity-80 transition-opacity"
          >
            <img src={signedUrl} alt="Documento" className="w-full h-auto object-cover max-h-48" />
          </a>
        ) : (
          <Button
            onClick={handleLoad}
            disabled={loading}
            variant="outline"
            className="w-full h-10 rounded-xl"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <FileText className="h-4 w-4 mr-1.5" />
            )}
            Visualizza documento
          </Button>
        )}
      </div>
    </div>
  );
}

// Pannello admin: documenti di verifica approfondita del professionista.
// Approvare un documento imposta automaticamente il badge visibile alle famiglie.
const DOC_LABELS: Record<string, string> = {
  casellario: "Casellario giudiziale",
  referenza: "Lettera di referenza",
  attestato: "Attestato formativo",
};

type ProDoc = {
  id: string;
  doc_type: string;
  status: string;
  created_at: string;
  url: string | null;
};

function ProVerificationPanel({ professionalId }: { professionalId: string }) {
  const fetchDocs = useServerFn(getProfessionalDocuments);
  const review = useServerFn(reviewProfessionalDocument);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [docs, setDocs] = useState<ProDoc[]>([]);
  const [badges, setBadges] = useState<Record<string, boolean>>({});
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchDocs({ data: { professionalId } });
      if (res.success) {
        setDocs((res.documents as ProDoc[]) || []);
        setBadges((res.badges as Record<string, boolean>) || {});
        setLoaded(true);
      } else {
        toast.error(res.error || "Impossibile caricare i documenti.");
      }
    } catch {
      toast.error("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }, [fetchDocs, professionalId]);

  async function handleReview(documentId: string, status: "approved" | "rejected") {
    setActing(documentId);
    try {
      const res = await review({ data: { documentId, status } });
      if (res.success) {
        toast.success(status === "approved" ? "Documento approvato." : "Documento rifiutato.");
        await load();
      } else {
        toast.error(res.error || "Operazione non riuscita.");
      }
    } catch {
      toast.error("Errore di connessione.");
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-2 border-t border-border/60 pt-3">
      <span className="text-xs font-semibold text-muted-foreground uppercase">
        Verifica approfondita
      </span>

      {!loaded ? (
        <Button
          onClick={load}
          disabled={loading}
          variant="outline"
          className="w-full h-10 rounded-xl"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <ShieldCheck className="h-4 w-4 mr-1.5" />
          )}
          Carica documenti verifica
        </Button>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(badges).map(([type, on]) => (
              <span
                key={type}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  on ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
                }`}
              >
                {on ? <ShieldCheck className="w-3 h-3" /> : null} {DOC_LABELS[type] || type}
                {on ? " ✓" : ""}
              </span>
            ))}
          </div>

          {docs.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nessun documento caricato.</p>
          ) : (
            <div className="space-y-2">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">
                      {DOC_LABELS[d.doc_type] || d.doc_type}
                    </div>
                    <div className="text-[11px] text-muted-foreground capitalize">{d.status}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {d.url && (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="h-7 px-2 grid place-items-center rounded-md border border-border/60 text-xs hover:bg-muted"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleReview(d.id, "approved")}
                      disabled={acting === d.id}
                      className="h-7 w-7 grid place-items-center rounded-md bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
                      title="Approva"
                    >
                      {acting === d.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleReview(d.id, "rejected")}
                      disabled={acting === d.id}
                      className="h-7 w-7 grid place-items-center rounded-md bg-rose-100 text-rose-800 hover:bg-rose-200 disabled:opacity-50"
                      title="Rifiuta"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Pannello admin concierge: cura la rosa (max 10) e presenta i migliori (max 3)
// a una famiglia. La famiglia (Premium) vede solo i profili "presentati".
type ShortlistItem = {
  selectionId: string;
  professionalId: string;
  presented: boolean;
  notes: string | null;
  full_name: string | null;
  city: string | null;
  experience: string | null;
};
type AvailablePro = { id: string; full_name: string | null; city: string | null };

function ConciergeAdminPanel({
  familyId,
  planTier,
}: {
  familyId: string;
  planTier?: string | null;
}) {
  const fetchData = useServerFn(getConciergeData);
  const addSel = useServerFn(addConciergeSelection);
  const removeSel = useServerFn(removeConciergeSelection);
  const togglePresented = useServerFn(setPresented);

  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
  const [available, setAvailable] = useState<AvailablePro[]>([]);
  const [toAdd, setToAdd] = useState("");
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchData({ data: { familyId } });
      if (res.success) {
        setShortlist((res.shortlist as ShortlistItem[]) || []);
        setAvailable((res.availablePros as AvailablePro[]) || []);
        setLoaded(true);
      } else {
        toast.error(res.error || "Errore nel caricamento.");
      }
    } catch {
      toast.error("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }, [fetchData, familyId]);

  async function handleAdd() {
    if (!toAdd) return;
    setActing(true);
    try {
      const res = await addSel({ data: { familyId, professionalId: toAdd } });
      if (res.success) {
        setToAdd("");
        await load();
      } else toast.error(res.error || "Impossibile aggiungere.");
    } finally {
      setActing(false);
    }
  }

  async function handleRemove(selectionId: string) {
    setActing(true);
    try {
      const res = await removeSel({ data: { selectionId } });
      if (res.success) await load();
      else toast.error(res.error || "Impossibile rimuovere.");
    } finally {
      setActing(false);
    }
  }

  async function handleToggle(selectionId: string, presented: boolean) {
    setActing(true);
    try {
      const res = await togglePresented({ data: { selectionId, presented } });
      if (res.success) await load();
      else toast.error(res.error || "Operazione non riuscita.");
    } finally {
      setActing(false);
    }
  }

  const presentedCount = shortlist.filter((s) => s.presented).length;

  return (
    <div className="space-y-2 border-t border-border/60 pt-3">
      <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-primary" /> Concierge
        {planTier !== "premium" && (
          <span className="ml-1 normal-case font-normal text-[11px] text-amber-600">
            (piano non Premium — la famiglia non vedrà i profili)
          </span>
        )}
      </span>

      {!loaded ? (
        <Button
          onClick={load}
          disabled={loading}
          variant="outline"
          className="w-full h-10 rounded-xl"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
          Gestisci rosa concierge
        </Button>
      ) : (
        <>
          <p className="text-[11px] text-muted-foreground">
            Rosa: {shortlist.length}/10 · Presentati: {presentedCount}/3
          </p>

          {shortlist.length > 0 && (
            <div className="space-y-1.5">
              {shortlist.map((s) => (
                <div
                  key={s.selectionId}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">
                      {s.full_name || "Professionista"}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {s.city || "—"} · {s.experience || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggle(s.selectionId, !s.presented)}
                      disabled={acting}
                      className={`h-7 px-2 grid place-items-center rounded-md text-[11px] font-medium disabled:opacity-50 ${
                        s.presented
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                      title={s.presented ? "Nascondi" : "Presenta"}
                    >
                      {s.presented ? "Presentato" : "Presenta"}
                    </button>
                    <button
                      onClick={() => handleRemove(s.selectionId)}
                      disabled={acting}
                      className="h-7 w-7 grid place-items-center rounded-md bg-rose-100 text-rose-800 hover:bg-rose-200 disabled:opacity-50"
                      title="Rimuovi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {shortlist.length < 10 && (
            <div className="flex items-center gap-2 pt-1">
              <select
                value={toAdd}
                onChange={(e) => setToAdd(e.target.value)}
                className="flex-1 h-9 rounded-md border border-input bg-background px-2 text-xs outline-none"
              >
                <option value="">Aggiungi un professionista…</option>
                {available.map((p) => (
                  <option key={p.id} value={p.id}>
                    {(p.full_name || "Professionista") + (p.city ? ` — ${p.city}` : "")}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAdd}
                disabled={!toAdd || acting}
                size="icon"
                className="h-9 w-9 rounded-md shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
