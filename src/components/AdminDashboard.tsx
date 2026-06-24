import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getWaitlist, updateWaitlistStatus } from "@/functions/waitlist.functions";
import { toast } from "sonner";
import {
  ShieldAlert,
  Loader2,
  Users,
  Search,
  Filter,
  Eye,
  Star,
  CheckCircle,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


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
}

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const fetchLeads = useServerFn(getWaitlist);
  const updateStatus = useServerFn(updateWaitlistStatus);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "famiglia" | "professionista">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Load leads
  const loadLeads = async () => {
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
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLeads();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default MVP admin password
    if (password === "admin123" || password === "familycare2026") {
      setIsAuthenticated(true);
      toast.success("Autenticato come amministratore.");
    } else {
      toast.error("Password errata. Riprova.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: "nuovo" | "contattato" | "in_verifica" | "attivo") => {
    try {
      const res = await updateStatus({ id, status: newStatus });
      if (res.success) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
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
    if (val >= 80) return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400";
    if (val >= 50) return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "attivo":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_verifica":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "contattato":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-slate-400" />;
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-card border border-border p-8 rounded-3xl shadow-soft w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary-soft text-primary grid place-items-center mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Accesso Amministrazione</h2>
            <p className="text-sm text-muted-foreground">
              Inserisci la password amministratore per visionare i candidati ed i lead.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Password Amministratore</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Inserisci la password"
                className="h-11 rounded-xl"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              Accedi <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </form>
          <div className="text-center text-xs text-muted-foreground">
            Sfoglia i tuoi dati in tempo reale · MVP Demo (Pass: <code className="bg-muted px-1 py-0.5 rounded font-mono">familycare2026</code>)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Header Stat Cards */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">Pipeline Leads & Candidati</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestisci le registrazioni delle famiglie e delle candidate badanti in tempo reale.
          </p>
        </div>
        <Button onClick={loadLeads} disabled={loading} variant="outline" className="h-10 rounded-xl">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
          Aggiorna dati
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Leads Totali</span>
          <span className="block text-3xl font-bold font-display mt-2 text-foreground">{leads.length}</span>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Famiglie</span>
          <span className="block text-3xl font-bold font-display mt-2 text-primary">
            {leads.filter((l) => l.user_type === "famiglia").length}
          </span>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Professionisti</span>
          <span className="block text-3xl font-bold font-display mt-2 text-accent">
            {leads.filter((l) => l.user_type === "professionista").length}
          </span>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Da Contattare</span>
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
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getScoreBadgeClass(lead.score)}`}>
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
                  <h3 className="font-display text-xl font-bold text-foreground">Dettaglio Profilo</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Registrato il {new Date(selectedLead.created_at).toLocaleString("it-IT")}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${getScoreBadgeClass(
                    selectedLead.score
                  )}`}
                >
                  Score: {selectedLead.score}%
                </span>
              </div>

              {/* Contact info list */}
              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Nome completo</span>
                  <div className="font-medium text-foreground">{selectedLead.full_name || "N/A"}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-primary" /> Telefono
                    </span>
                    <div>
                      {selectedLead.phone ? (
                        <a href={`tel:${selectedLead.phone}`} className="text-primary hover:underline font-medium">
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
                        <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline font-medium">
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
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Nazionalità</span>
                      <div className="text-foreground">{selectedLead.nationality || "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Esperienza</span>
                      <div className="text-foreground">{selectedLead.experience || "N/A"}</div>
                    </div>
                  </div>
                )}

                {selectedLead.user_type === "professionista" && (
                  <div className="space-y-1 border-t border-border/60 pt-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Lingua Italiana</span>
                    <div className="text-foreground">{selectedLead.italian_level || "N/A"}</div>
                  </div>
                )}

                <div className="space-y-1.5 border-t border-border/60 pt-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Servizi Richiesti/Offerti</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLead.services && selectedLead.services.length > 0 ? (
                      selectedLead.services.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-muted border border-border text-xs rounded font-medium text-foreground">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Nessun servizio specificato</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-border/60 pt-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Presentazione / Messaggio</span>
                  <div className="p-3 bg-muted rounded-xl text-xs text-foreground whitespace-pre-wrap max-h-[160px] overflow-y-auto leading-relaxed border border-border/60">
                    {selectedLead.message || "Nessun dettaglio aggiuntivo."}
                  </div>
                </div>
              </div>

              {/* Status Update section */}
              <div className="border-t border-border pt-4 space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Modifica Stato Pipeline</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["nuovo", "contattato", "in_verifica", "attivo"] as const).map((st) => (
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
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border border-dashed p-10 rounded-2xl text-center text-muted-foreground sticky top-24">
              <Eye className="h-8 w-8 mx-auto opacity-40 mb-3" />
              Seleziona un lead dalla tabella per visualizzare il profilo dettagliato e gestirne la pipeline amministrativa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
