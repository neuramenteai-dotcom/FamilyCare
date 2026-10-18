import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/termini")({
  head: () => ({
    meta: [
      { title: "Termini di Servizio — FamilyCare" },
      {
        name: "description",
        content:
          "Termini e Condizioni d'uso della piattaforma FamilyCare per famiglie e professionisti.",
      },
    ],
  }),
  component: TerminiPage,
});

function TerminiPage() {
  return (
    <LegalPage
      title="Termini di Servizio"
      intro="Condizioni che regolano l'uso della piattaforma FamilyCare."
    >
      <LegalSection title="1. Oggetto del servizio">
        <p>
          FamilyCare è un <strong>servizio tecnico di pubblicazione di annunci</strong>. I
          professionisti (babysitter, assistenti familiari, colf, dog sitter, tutor) redigono e
          pubblicano autonomamente il proprio profilo; le famiglie lo consultano e scelgono
          liberamente chi contattare.
        </p>
        <p>
          FamilyCare <strong>non svolge attività di intermediazione di manodopera</strong>, non
          seleziona né propone candidati per conto delle famiglie, non effettua abbinamenti e non
          stila graduatorie: i profili sono mostrati in ordine di iscrizione. FamilyCare{" "}
          <strong>non è datore di lavoro</strong> dei professionisti né parte del rapporto che si
          instaura tra famiglia e professionista.
        </p>
        <p>
          La verifica dell'identità descritta al punto 3 è una misura di sicurezza della
          piattaforma, applicata in modo uniforme a tutti coloro che pubblicano, e{" "}
          <strong>non costituisce valutazione di idoneità</strong> di una persona rispetto a una
          specifica famiglia o mansione.
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
          profilo. FamilyCare si riserva di sospendere o rimuovere i profili che non superano la
          verifica o che violano i presenti termini. La verifica non costituisce garanzia assoluta
          sull'idoneità del professionista, la cui valutazione resta in capo alla famiglia.
        </p>
      </LegalSection>

      <LegalSection title="4. Pagamenti">
        <p>
          Per le famiglie alcune funzionalità sono subordinate all'acquisto di un{" "}
          <strong>accesso di 30 giorni</strong>. Si tratta di un pagamento singolo: l'accesso{" "}
          <strong>non si rinnova automaticamente</strong> e alla scadenza cessa senza ulteriori
          addebiti. L'accesso dà diritto all'uso degli strumenti della piattaforma (consultazione
          completa dei profili, messaggistica e, nel livello superiore, videochiamate e ricerche
          salvate) e <strong>non pone alcun limite al numero di professionisti contattabili</strong>
          .
        </p>
        <p>
          È possibile richiedere il rimborso integrale dell'accesso{" "}
          <strong>fintanto che non sia stato aperto alcun contatto</strong> con un professionista. I
          pagamenti sono elaborati dal fornitore <strong>Stripe</strong>. Prezzi e condizioni sono
          indicati nella pagina{" "}
          <Link to="/prezzi" className="text-primary underline">
            Prezzi
          </Link>
          . L'iscrizione dei professionisti è gratuita e FamilyCare non trattiene commissioni sul
          rapporto tra famiglia e professionista.
        </p>
      </LegalSection>

      <LegalSection title="5. Adempimenti contrattuali e contributivi">
        <p>
          La stipula del contratto di lavoro domestico, gli adempimenti contributivi e la gestione
          delle buste paga <strong>non sono svolti da FamilyCare</strong>. Su richiesta della
          famiglia, FamilyCare può indicare un <strong>centro di assistenza autorizzato</strong>
          (CAF, consulente del lavoro o soggetto equivalente) che eroga tali servizi in via
          autonoma, sulla base di un rapporto contrattuale diretto tra la famiglia e quel soggetto.
        </p>
        <p>
          FamilyCare non è parte di quel rapporto, non presta assistenza sui singoli adempimenti e
          non risponde dell'operato del centro autorizzato.
        </p>
      </LegalSection>

      <LegalSection title="6. Obblighi degli utenti">
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

      <LegalSection title="7. Limitazione di responsabilità">
        <p>
          FamilyCare fornisce uno strumento di connessione e non risponde della condotta degli
          utenti né dell'esito dei rapporti instaurati tramite la piattaforma. Nei limiti consentiti
          dalla legge, è esclusa ogni responsabilità per danni derivanti dall'uso del servizio.
        </p>
      </LegalSection>

      <LegalSection title="8. Recesso">
        <p>
          L'utente può cessare l'utilizzo del servizio e richiedere la cancellazione dell'account in
          qualsiasi momento scrivendo a <strong>[EMAIL]</strong>. Restano fermi i diritti relativi
          agli acquisti già effettuati secondo la normativa sui consumatori.
        </p>
      </LegalSection>

      <LegalSection title="9. Modifiche ai termini">
        <p>
          FamilyCare può aggiornare i presenti termini; le modifiche rilevanti saranno comunicate
          agli utenti. L'uso continuato del servizio dopo la modifica ne comporta l'accettazione.
        </p>
      </LegalSection>

      <LegalSection title="10. Legge applicabile e foro competente">
        <p>
          I presenti termini sono regolati dalla legge italiana. Per le controversie con i
          consumatori è competente il foro del luogo di residenza o domicilio del consumatore; per
          gli altri casi il foro di <strong>[FORO]</strong>.
        </p>
      </LegalSection>

      <LegalSection title="11. Contatti">
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
