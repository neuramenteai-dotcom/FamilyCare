import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/cookie")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Family Care" },
      {
        name: "description",
        content:
          "Informativa sui cookie utilizzati da Family Care. Il sito impiega solo cookie tecnici necessari al funzionamento.",
      },
    ],
  }),
  component: CookiePage,
});

function CookiePage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro="Come Family Care utilizza i cookie e le tecnologie simili."
    >
      <LegalSection title="1. Cosa sono i cookie">
        <p>
          I cookie sono piccoli file di testo che i siti visitati inviano al dispositivo
          dell'utente, dove vengono memorizzati per essere ritrasmessi agli stessi siti alla visita
          successiva.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookie utilizzati da questo sito">
        <p>
          Family Care utilizza <strong>esclusivamente cookie tecnici</strong> necessari al
          funzionamento e all'autenticazione. Non utilizziamo cookie di profilazione, pubblicitari o
          di tracciamento di terze parti.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse mt-2">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-semibold">Cookie</th>
                <th className="py-2 pr-4 font-semibold">Finalità</th>
                <th className="py-2 font-semibold">Tipo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4">Sessione Supabase</td>
                <td className="py-2 pr-4">
                  Mantenere l'utente autenticato durante la navigazione nell'area riservata.
                </td>
                <td className="py-2">Tecnico</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="3. Consenso">
        <p>
          Ai sensi delle Linee guida del Garante per la protezione dei dati personali, i cookie
          tecnici non richiedono il consenso preventivo dell'utente. Per questo motivo il sito non
          mostra un banner di scelta dei cookie.
        </p>
        <p>
          Qualora in futuro venissero introdotti cookie di analisi o profilazione, questa policy
          sarà aggiornata e verrà richiesto il consenso tramite un apposito banner.
        </p>
      </LegalSection>

      <LegalSection title="4. Gestione dei cookie">
        <p>
          Puoi bloccare o eliminare i cookie tramite le impostazioni del tuo browser; la
          disabilitazione dei cookie tecnici può però impedire l'accesso alle aree riservate.
        </p>
      </LegalSection>

      <LegalSection title="5. Ulteriori informazioni">
        <p>
          Per il trattamento dei dati personali consulta la{" "}
          <Link to="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
