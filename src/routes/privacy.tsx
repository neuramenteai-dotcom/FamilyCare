import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Family Care" },
      {
        name: "description",
        content:
          "Informativa sul trattamento dei dati personali di Family Care ai sensi degli artt. 13-14 del Regolamento UE 2016/679 (GDPR).",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Informativa sulla Privacy"
      intro="Trattamento dei dati personali ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 (GDPR)."
    >
      <LegalSection title="1. Titolare del trattamento">
        <p>
          Il titolare del trattamento è <strong>[TITOLARE]</strong>, con sede in{" "}
          <strong>[INDIRIZZO]</strong>, C.F./P.IVA <strong>[P.IVA / C.F.]</strong>. Per qualsiasi
          questione relativa ai tuoi dati puoi scrivere a <strong>[EMAIL]</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Categorie di dati trattati">
        <p>Nell'ambito del servizio trattiamo:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Dati identificativi e di contatto</strong>: nome, cognome, email, numero di
            telefono, città/zona.
          </li>
          <li>
            <strong>Dati di candidatura</strong> (professionisti): nazionalità, data di nascita,
            esperienza, servizi offerti, livello di italiano, presentazione.
          </li>
          <li>
            <strong>Documenti d'identità</strong>: immagine del documento caricato ai fini della
            verifica del profilo.
          </li>
          <li>
            <strong>Dati di pagamento</strong> (famiglie): gestiti direttamente dal fornitore
            Stripe; non conserviamo i dati della carta.
          </li>
          <li>
            <strong>Dati tecnici</strong>: dati di sessione necessari all'autenticazione.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalità e basi giuridiche">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Erogazione del servizio</strong> (registrazione, matching
            famiglia/professionista, verifica del profilo, pagamenti) — base giuridica: esecuzione
            del contratto (art. 6.1.b GDPR).
          </li>
          <li>
            <strong>Verifica dell'identità</strong> tramite analisi automatizzata del documento —
            base giuridica: esecuzione del contratto e legittimo interesse alla sicurezza della
            piattaforma (art. 6.1.b e 6.1.f).
          </li>
          <li>
            <strong>Comunicazioni promozionali</strong> (email/WhatsApp) — base giuridica: consenso,
            prestato in modo libero e revocabile (art. 6.1.a).
          </li>
          <li>
            <strong>Adempimenti di legge</strong> (fiscali, contabili) — base giuridica: obbligo
            legale (art. 6.1.c).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Destinatari e responsabili del trattamento">
        <p>
          Per erogare il servizio ci avvaliamo di fornitori che agiscono come responsabili del
          trattamento, ciascuno con adeguate garanzie contrattuali:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Supabase</strong> (database e archiviazione file, infrastruttura in UE);
          </li>
          <li>
            <strong>Cloudflare</strong> (hosting dell'applicazione e distribuzione);
          </li>
          <li>
            <strong>Stripe</strong> (elaborazione dei pagamenti);
          </li>
          <li>
            <strong>Google (Gemini API)</strong> per l'analisi automatizzata del documento
            d'identità;
          </li>
          <li>
            <strong>Daily.co</strong> per le videochiamate tra famiglie e professionisti;
          </li>
          <li>
            <strong>Google (Gmail SMTP)</strong> per l'invio delle email transazionali.
          </li>
        </ul>
        <p>I dati non sono ceduti a terzi per finalità proprie né diffusi.</p>
      </LegalSection>

      <LegalSection title="5. Trasferimenti extra-UE">
        <p>
          Alcuni fornitori (in particolare Google per l'analisi del documento) possono trattare dati
          al di fuori dello Spazio Economico Europeo. In tali casi il trasferimento avviene sulla
          base delle Clausole Contrattuali Standard approvate dalla Commissione Europea o di altre
          garanzie adeguate ai sensi degli artt. 44 e seguenti del GDPR.
        </p>
      </LegalSection>

      <LegalSection title="6. Periodo di conservazione">
        <p>
          I dati sono conservati per il tempo necessario alle finalità indicate e, successivamente,
          per i termini di legge (es. obblighi fiscali). I documenti d'identità sono conservati solo
          per il tempo necessario alla verifica e comunque non oltre <strong>[PERIODO]</strong>. I
          dati trattati sulla base del consenso sono conservati fino alla revoca dello stesso.
        </p>
      </LegalSection>

      <LegalSection title="7. Diritti dell'interessato">
        <p>
          Puoi esercitare in ogni momento i diritti previsti dagli artt. 15-22 del GDPR: accesso,
          rettifica, cancellazione, limitazione, opposizione, portabilità e{" "}
          <strong>revoca del consenso</strong> (che non pregiudica la liceità del trattamento
          effettuato prima della revoca). Per esercitarli scrivi a <strong>[EMAIL]</strong>.
        </p>
        <p>
          Hai inoltre il diritto di proporre reclamo all'Autorità Garante per la protezione dei dati
          personali (<span className="whitespace-nowrap">www.garanteprivacy.it</span>).
        </p>
      </LegalSection>

      <LegalSection title="8. Cookie">
        <p>
          Il sito utilizza esclusivamente cookie tecnici necessari al funzionamento. Per i dettagli
          consulta la{" "}
          <Link to="/cookie" className="text-primary underline">
            Cookie Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
