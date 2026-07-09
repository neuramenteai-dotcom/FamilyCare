import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/termini")({
  head: () => ({
    meta: [
      { title: "Termini di Servizio — Family Care" },
      {
        name: "description",
        content:
          "Termini e Condizioni d'uso della piattaforma Family Care per famiglie e professionisti della cura.",
      },
    ],
  }),
  component: TerminiPage,
});

function TerminiPage() {
  return (
    <LegalPage
      title="Termini di Servizio"
      intro="Condizioni che regolano l'uso della piattaforma Family Care."
    >
      <LegalSection title="1. Oggetto del servizio">
        <p>
          Family Care è una <strong>piattaforma di intermediazione</strong> che mette in contatto
          famiglie che cercano servizi di cura e professionisti che li offrono (babysitter,
          collaboratori domestici, colf, dog sitter, tutor). Family Care{" "}
          <strong>non è datore di lavoro</strong> dei professionisti né parte del rapporto che si
          instaura tra famiglia e professionista.
        </p>
      </LegalSection>

      <LegalSection title="2. Registrazione e account">
        <p>
          Per utilizzare i servizi è necessario registrarsi fornendo dati veritieri e completi, e
          confermare il proprio indirizzo email. L'utente è responsabile della riservatezza delle
          proprie credenziali e delle attività svolte tramite il proprio account.
        </p>
      </LegalSection>

      <LegalSection title="3. Verifica dei professionisti">
        <p>
          I professionisti sono tenuti a caricare un documento d'identità valido per la verifica del
          profilo. Family Care si riserva di sospendere o rimuovere i profili che non superano la
          verifica o che violano i presenti termini. La verifica non costituisce garanzia assoluta
          sull'idoneità del professionista, la cui valutazione resta in capo alla famiglia.
        </p>
      </LegalSection>

      <LegalSection title="4. Pagamenti">
        <p>
          L'accesso ad alcune funzionalità per le famiglie è subordinato all'acquisto di un
          pacchetto. I pagamenti sono elaborati dal fornitore <strong>Stripe</strong>. Prezzi e
          condizioni sono indicati nella pagina{" "}
          <Link to="/prezzi" className="text-primary underline">
            Prezzi
          </Link>
          . L'iscrizione dei professionisti è gratuita.
        </p>
      </LegalSection>

      <LegalSection title="5. Obblighi degli utenti">
        <ul className="list-disc pl-5 space-y-1">
          <li>Fornire informazioni veritiere e mantenerle aggiornate.</li>
          <li>Non utilizzare la piattaforma per finalità illecite o ingannevoli.</li>
          <li>Rispettare la dignità e i diritti degli altri utenti.</li>
          <li>
            Regolarizzare il rapporto di lavoro nel rispetto della normativa vigente, ove
            applicabile.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Limitazione di responsabilità">
        <p>
          Family Care fornisce uno strumento di connessione e non risponde della condotta degli
          utenti né dell'esito dei rapporti instaurati tramite la piattaforma. Nei limiti consentiti
          dalla legge, è esclusa ogni responsabilità per danni derivanti dall'uso del servizio.
        </p>
      </LegalSection>

      <LegalSection title="7. Recesso">
        <p>
          L'utente può cessare l'utilizzo del servizio e richiedere la cancellazione dell'account in
          qualsiasi momento scrivendo a <strong>[EMAIL]</strong>. Restano fermi i diritti relativi
          agli acquisti già effettuati secondo la normativa sui consumatori.
        </p>
      </LegalSection>

      <LegalSection title="8. Modifiche ai termini">
        <p>
          Family Care può aggiornare i presenti termini; le modifiche rilevanti saranno comunicate
          agli utenti. L'uso continuato del servizio dopo la modifica ne comporta l'accettazione.
        </p>
      </LegalSection>

      <LegalSection title="9. Legge applicabile e foro competente">
        <p>
          I presenti termini sono regolati dalla legge italiana. Per le controversie con i
          consumatori è competente il foro del luogo di residenza o domicilio del consumatore; per
          gli altri casi il foro di <strong>[FORO]</strong>.
        </p>
      </LegalSection>

      <LegalSection title="10. Contatti">
        <p>
          Per qualsiasi richiesta relativa ai presenti termini puoi scrivere a{" "}
          <strong>[EMAIL]</strong> o utilizzare la pagina{" "}
          <Link to="/contatti" className="text-primary underline">
            Contatti
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
