# NeuraMenteAI FamilyCare

## 1. Scopo Principale del Progetto

**FamilyCare** è una piattaforma web che mette in contatto **famiglie** che cercano assistenza e **professionisti** del settore caregiving (babysitter, assistenti familiari, colf, dog sitter, tutor).

Il servizio è volutamente limitato: FamilyCare **pubblica annunci e fornisce strumenti di contatto**, non seleziona, non propone candidati e non colloca nessuno. A scegliere è sempre la famiglia. Questa non è una scelta di stile ma il perimetro che tiene l'attività fuori dall'**intermediazione di manodopera**, che in Italia è regolata dal D.Lgs. 276/2003 e richiede autorizzazione ministeriale. Chi modifica il prodotto deve conoscere questo vincolo: diverse funzioni sono state deliberatamente rimosse per rispettarlo, ed è spiegato dove.

La parte contrattuale e contributiva del rapporto di lavoro (contratto, buste paga, contributi) è **esternalizzata a centri autorizzati** tipo CAF: la piattaforma non la gestisce.

## 2. Architettura

L'architettura è orientata al serverless, suddivisa in:

- **Frontend**: **React 19** con **Vite 7**. Interfaccia in **Tailwind CSS v4** con componenti headless **Radix UI** (stile shadcn/ui). Navigazione con **TanStack Router**, type-safe.
- **Backend / Server-Side**: **TanStack Start**, che integra le funzioni server nel framework frontend (`createServerFn`, `createMiddleware`). Il deployment è su **Cloudflare Workers** (Wrangler, nome del worker `familycare`).
- **Database e Autenticazione**: **Supabase** (PostgreSQL). Gestisce sessioni (Auth), dati applicativi (PostgREST) e regole di sicurezza (Row Level Security).

## 3. Flussi di Dati Principali

1.  **Iscrizione e Autenticazione (Waitlist & Auth)**:
    - I nuovi utenti compilano il form scegliendo il ruolo (`famiglia` o `professionista`). I dati finiscono nella tabella `waitlist`.
    - Creato l'account, il record viene collegato all'utente di Supabase Auth tramite `auth_id`.
    - **Double opt-in**: l'email non viene auto-confermata, l'utente deve cliccare il link inviato da Supabase (`emailRedirectTo` → `/conferma-email`). Rende dimostrabili consenso e titolarità dell'indirizzo.
    - Esistono i flussi completi di login, recupero e aggiornamento password.

2.  **Verifica dell'identità**:

    Due percorsi, che convivono. In **entrambi i casi la pubblicazione richiede l'approvazione di una persona**: nessun automatismo rende visibile un profilo.

    - **Stripe Identity** (`identity.functions.ts`, `/verifica-identita/$id`): il professionista viene mandato sulle pagine di Stripe, che confronta documento e selfie. Le immagini restano a Stripe, **non passano dai nostri server**. A esito positivo il profilo va in `pre_approvato`.
    - **Pre-controllo con Google Gemini** (`src/server/ai-verification.ts`, usato da `upload.functions.ts`): sul documento caricato nel bucket privato viene estratto nome e cognome e confrontato con quanto dichiarato (`src/server/name-match.ts`). È un **aiuto all'operatore, non un verdetto**: la soglia è `confidence >= 1`, cioè corrispondenza piena, e un esito positivo non pubblica niente.
    - **SPID e CIE non sono implementati.** Una bozza precedente conteneva un endpoint `completeSpidVerification` che scriveva `identity_verified = true` accettando il nome del gestore come stringa libera, senza validare alcuna asserzione firmata: qualunque utente registrato poteva dichiararsi verificato. È stato rimosso (commit `1e089c7`). SPID/CIE si possono aggiungere solo con un'integrazione presso un **aggregatore accreditato AgID** che validi l'asserzione del gestore. Da tenere presente: molti professionisti extracomunitari non hanno un'identità digitale italiana, quindi SPID non può essere il canale unico.

    **Stati del profilo** (`waitlist.status`): `nuovo` → `contattato` → `in_verifica` → `pre_approvato` → `attivo`. Solo `attivo` è visibile alle famiglie, e l'unico percorso che ci porta è `updateWaitlistStatus`, protetto da `requireAdmin`.

3.  **Dashboard e Matching**:
    - **Famiglie** (`famiglia.dashboard.tsx`): mostra i profili `attivo`. Senza accesso attivo si vede un teaser; con l'accesso si vedono età, sesso, nazionalità, esperienza, servizi, zona, biografia e video.
    - **I bollini di verifica si vedono sempre**, anche senza pagare. Scelta deliberata: dietro l'accesso stanno la profondità del profilo e la comunicazione, mai le informazioni di sicurezza.
    - **Professionisti** (`professionista.dashboard.tsx`): scorrono le richieste delle famiglie con accesso attivo ed esprimono `like`/`dislike` (tabella `professional_interests`).

4.  **Flusso Amministrativo**:
    - La route `admin.tsx` è riservata agli account con `app_metadata.role = 'admin'` su Supabase Auth (assegnato dalla migration `20260707100000_admin_role.sql`). Le funzioni amministrative sono protette lato server dal middleware `requireAdmin`.
    - L'approvazione di un professionista è un **gesto umano obbligatorio**. Nel momento in cui il profilo passa ad `attivo`, `updateWaitlistStatus` fa partire gli avvisi alle famiglie con una ricerca salvata corrispondente (`src/server/avvisi-ricerche.ts`). È l'unico punto da cui partono: chi aggiunge altre strade verso `attivo` li salta in silenzio.

5.  **Accesso a tempo (non abbonamento)**:

    Il modello è definito in `src/lib/plans.ts`. Non è un abbonamento ricorrente ma un **accesso a tempo di 30 giorni** (`DURATA_ACCESSO_GIORNI`), pagato una volta sola (`mode: "payment"` nel checkout). Una famiglia cerca, trova e smette: vendere un abbonamento a chi resta un mese o due produce disdette dimenticate e rimborsi.

    | Livello | Prezzo | Durata | Contatti | Bollini verifica | Videochiamate | Ricerche salvate |
    | ------- | ------ | -------- | ----------- | ---------------- | ------------- | ---------------- |
    | Accesso | 39€ | 30 giorni | illimitati | visibili a tutti | — | — |
    | Accesso Plus | 59€ | 30 giorni | illimitati | visibili a tutti | ✓ | ✓ (max 10) |

    **I contatti sono illimitati a ogni livello, ed è un vincolo legale, non una generosità.** Far pagare in base al numero di lavoratori che si possono contattare avvicina l'attività all'intermediazione di manodopera. Si vendono **strumenti** (chat, video, ricerche salvate), mai accesso misurato a persone. Non reintrodurre un contatore.

    La fonte di verità dell'accesso è la **data di scadenza** (`waitlist.access_expires_at`), non lo stato di un abbonamento Stripe: `hasActivePlan()` confronta la scadenza con l'ora corrente.

    `ABBONAMENTI_ATTIVI = false` tiene il lato famiglie in modalità lista d'attesa: la pagina prezzi mostra i livelli ma raccoglie manifestazioni di interesse invece di aprire il checkout.

6.  **Contatti e Chat**:
    - La famiglia contatta un professionista (`contactProfessional`): serve un accesso attivo, il contatto viene registrato in `family_contacts` (serve a sapere con chi si è già parlato, non a contare) e si apre una `conversations`. Nome completo ed email vengono svelati solo dopo il contatto.
    - Chat testuale in tempo reale (`/chat/$conversationId`): invio via server function autenticata, ricezione via **Supabase Realtime**. `conversations` e `messages` hanno **RLS reale**: leggono solo i due partecipanti.
    - **Filtro dei recapiti** (`src/server/contact-filter.ts`): i messaggi che contengono numeri di telefono, email o handle social vengono bloccati, compresi i numeri **scritti a parole**. Il filtro è calibrato per non bloccare il linguaggio normale: "ho tre bambini di due e cinque anni", "dalle otto alle sei", "9 euro all'ora" passano. Copertura in `contact-filter.test.ts`, dove metà dei casi verifica proprio i falsi positivi.

7.  **Videochiamate (Daily.co)**:
    - Riservate al livello **Plus**. `createVideoRoom` verifica partecipazione e accesso attivo, crea una stanza privata Daily e un token a scadenza; il video è **embedded** nella pagina (`VideoCall.tsx`), senza uscire dal sito.

8.  **Ricerche salvate con avviso**:
    - Incluse nel livello **Plus**, massimo 10 per famiglia (`ricerche.functions.ts`, tabella `ricerche_salvate`).
    - La famiglia descrive da sé cosa cerca (città, zona, servizi) e riceve un'email quando entra un profilo che corrisponde.
    - Hanno sostituito il concierge **senza farne il lavoro**: il concierge selezionava profili per conto della famiglia, cioè selezione di personale. Qui a scegliere resta la famiglia, e l'avviso parte solo quando il profilo è già stato approvato e pubblicato: non esiste un canale che anticipi la pubblicazione.

9.  **Verifica approfondita professionisti**:
    - Il professionista carica casellario giudiziale, referenze e attestati (`/professionista/verifica-documenti`) in un bucket **privato** (`pro_documents`).
    - L'admin li rivede tramite signed URL e, approvandoli, imposta i bollini `criminal_check_verified`, `references_verified`, `certificates_verified`.
    - Le famiglie vedono **solo i bollini**, mai i documenti (scelta deliberata: i dati giudiziari sono categoria particolare ex art. 10 GDPR).

### Funzioni rimosse di proposito

Non vanno reintrodotte senza una valutazione legale. La tabella `concierge_selections` e i relativi tipi generati esistono ancora nel database ma **non sono usati da nessun codice**.

| Rimossa | Motivo |
| --- | --- |
| Concierge (selezione curata dall'admin) | È selezione di personale per conto della famiglia |
| Cap dei contatti per livello | Far pagare per numero di lavoratori contattabili avvicina all'intermediazione |
| Livello Premium | Esisteva solo per vendere il concierge |
| Abbonamento ricorrente | Sostituito dall'accesso a tempo |
| Pubblicazione automatica dopo verifica documento | Il sito dichiara che un profilo lo controlla una persona; deve essere vero |
| `completeSpidVerification` e interfaccia SPID/CIE | Non autenticava niente e mostrava i marchi dei gestori accreditati |

## 4. Dipendenze Chiave

- **Framework & Build**:
  - `react`, `react-dom` (v19)
  - `vite`, `@cloudflare/vite-plugin`, `wrangler` (deployment serverless)
  - `@tanstack/react-router`, `@tanstack/react-start` (routing SSR/SPA)
- **UI & Styling**:
  - `tailwindcss` (v4), `@tailwindcss/vite`
  - Ecosistema `@radix-ui/react-*` (Dialog, Popover, Select, ecc.)
  - `lucide-react` (icone), `recharts` (grafici), `embla-carousel-react` (caroselli)
- **Gestione Stato & Form**:
  - `react-hook-form` + `zod` + `@hookform/resolvers`
  - `@tanstack/react-query` (data fetching e caching)
- **Servizi Esterni & Backend**:
  - `@supabase/supabase-js` (database & auth)
  - `stripe` (pagamenti una tantum e **Stripe Identity** per la verifica documenti)
  - `@google/genai` (pre-controllo OCR sul documento caricato)
  - `nodemailer` (invio email via SMTP Gmail)
- **Test**: `vitest`. I test stanno accanto al sorgente (es. `src/server/contact-filter.test.ts`).

## 5. Sicurezza

- **Autenticazione server-side**: ogni server function protetta usa il middleware `requireSupabaseAuth` (o `requireAdmin`): il client allega il token di sessione Supabase come header `Authorization: Bearer`, il server lo valida e deriva l'identità dell'utente dalla sessione — mai da ID passati dal client.
- **Autorizzazione**: le operazioni su dati utente verificano sempre l'ownership tramite `waitlist.auth_id` (helper `getOwnedWaitlistRecord` in `src/server/authz.ts`). Le funzioni amministrative richiedono `app_metadata.role = 'admin'`.
- **Sessioni di verifica**: `checkStripeIdentitySession` confronta `session.metadata.waitlistId` con il profilo di chi chiama. L'id della sessione torna nell'URL dopo il redirect di Stripe: senza quel confronto basterebbe riusare l'id di una sessione verificata di un altro.
- **Service role key**: usata solo lato server (`client.server.ts`), letta esclusivamente da `SUPABASE_SERVICE_ROLE_KEY`. Non deve MAI comparire nel codice, nei log o nel bundle client.
- **Documenti**: bucket Storage privati (`identity_docs`, `pro_documents`); l'admin li visualizza tramite signed URL temporanei generati server-side. Mai esposti alle famiglie. Il bucket `avatars` è pubblico ma limitato per tipo MIME e dimensione (migration `20260928120000`).
- **Webhook Stripe**: la firma è verificata con `constructEventAsync` prima di leggere qualunque campo dell'evento.
- **RLS**: `conversations` e `messages` hanno policy che limitano la lettura ai soli partecipanti (join su `waitlist.auth_id = auth.uid()`). Le altre tabelle applicative sono accessibili solo via service role dalle server function.
- **GDPR**: consenso provabile alla registrazione (privacy obbligatoria + marketing separato, con timestamp e versione policy), double opt-in via email, pagine legali in `/privacy`, `/cookie`, `/termini`.

## 6. Setup

1.  Copia `.env.example` in `.env` e compila le variabili (Supabase, Stripe, Gemini, Daily, email).
2.  `pnpm install` (il progetto usa **pnpm**, dichiarato in `packageManager`).
3.  Applica le migration in `supabase/migrations/` in ordine cronologico (`supabase db push` o SQL editor).
4.  **Stripe**: crea **2 prodotti con prezzo una tantum** (39 / 59 EUR) e metti i Price ID in `STRIPE_PRICE_BASE` e `STRIPE_PRICE_PLUS`. Non serve il Customer Portal: non ci sono abbonamenti da disdire.
5.  **Stripe Identity**: attiva Identity sull'account Stripe (serve per `identity.verification_session.*`).
6.  **Webhook Stripe**: endpoint `https://<dominio>/api/stripe-webhook` con gli eventi `checkout.session.completed`, `identity.verification_session.verified`, `identity.verification_session.requires_input`; salva il signing secret in `STRIPE_WEBHOOK_SECRET`.
7.  **Supabase Auth**: attiva "Confirm email" e aggiungi `<dominio>/conferma-email` alle Redirect URLs.
8.  **Deploy Cloudflare**: i secret server-side con `wrangler secret put <NOME>` (o `scripts/cf-secrets.sh`, che li passa da `.env` senza mostrarli a schermo); le `VITE_*` vanno impostate come **build variables**, perché servono al bundle client al momento della build, non a runtime.
9.  Comandi: `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

> **Nota sul piano Supabase**: in piano gratuito il progetto viene **messo in pausa dopo circa una settimana di inattività** e il nome host smette di risolvere. Il frontend su Workers continua a rispondere, ma login, iscrizioni e ricerca si fermano. Prima di aprire le iscrizioni al pubblico conviene passare a un piano che non sospende.

> **Nota sulle chiavi Supabase**: il progetto supporta sia le chiavi legacy JWT (`eyJ...`) sia le nuove (`sb_publishable_...` / `sb_secret_...`). Se ruoti le chiavi, aggiornale **prima** ovunque (`.env` locale + secret Cloudflare) e **solo dopo** disattiva le legacy, altrimenti il sito va offline.

> **Nota sugli eventi legacy nel webhook**: `api.stripe-webhook.ts` gestisce ancora `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid` e `invoice.payment_failed`, rimasti dal modello ad abbonamento. Con `mode: "payment"` non arrivano più, ma restano innocui per gli eventuali abbonamenti creati prima del cambio.
