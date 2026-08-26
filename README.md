# NeuraMenteAI FamilyCare

## 1. Scopo Principale del Progetto

**FamilyCare** è una piattaforma web sviluppata per connettere **Famiglie** che necessitano di assistenza e **Professionisti** del settore caregiving (babysitter, badanti, tutor, ecc.).
L'applicazione gestisce un flusso completo che parte dalla lista d'attesa (waitlist) fino all'accesso a dashboard personalizzate in base al ruolo dell'utente. Una delle funzionalità distintive è il sistema di **Verifica dell'Identità basato sull'Intelligenza Artificiale**, che analizza i documenti caricati dagli utenti per prevenire frodi, e un sistema di **matching/interessi** in cui i professionisti possono esprimere preferenze (like/dislike) verso specifiche richieste delle famiglie.

## 2. Architettura

L'architettura del progetto è moderna e orientata al serverless, suddivisa in:

- **Frontend**: Sviluppato in **React 19** con **Vite**. L'interfaccia utente è costruita utilizzando **Tailwind CSS v4** e un ricco set di componenti headless tramite **Radix UI** (in stile shadcn/ui). La navigazione è gestita dal potente e type-safe **TanStack Router**.
- **Backend / Server-Side**: Utilizza **TanStack Start**, che permette di integrare funzioni server direttamente nel framework frontend. Il deployment è configurato per l'infrastruttura edge di **Cloudflare** (tramite Wrangler).
- **Database e Autenticazione**: Il cuore dei dati e della gestione utenti è affidato a **Supabase** (PostgreSQL). Supabase gestisce le sessioni (Auth), i dati dell'applicazione (tramite PostgREST) e le regole di sicurezza (Row Level Security - RLS).

## 3. Flussi di Dati Principali

1.  **Iscrizione e Autenticazione (Waitlist & Auth)**:
    - I nuovi utenti compilano il form selezionando il proprio ruolo (`famiglia` o `professionista`). I dati finiscono inizialmente nella tabella `waitlist`.
    - Una volta creato un account vero e proprio, il record nella `waitlist` viene collegato all'utente di Supabase Auth tramite un `auth_id`.
    - Sono presenti flussi completi per il login, il recupero e l'aggiornamento della password.

2.  **Verifica dell'Identità (AI Verification)**:
    - L'utente carica una foto del proprio documento d'identità.
    - L'immagine viene inviata al server (tramite `ai-verification.ts`).
    - Il server interroga le API di **Google Gemini (GenAI)** per estrarre nome e cognome dal documento visivo.
    - I dati estratti vengono confrontati con quelli dichiarati dall'utente (con calcolo di un indice di confidenza) per validare l'identità in modo automatizzato.

3.  **Dashboard e Matching**:
    - **Famiglie**: `famiglia.dashboard.tsx` mostra i profili con **visibilità differenziata per piano** (senza abbonamento solo un teaser; con abbonamento età, sesso, nazionalità, esperienza, servizi, zona, bio e video).
    - **Professionisti**: `professionista.dashboard.tsx`. Possono scorrere le richieste delle famiglie paganti ed esprimere `like`/`dislike` (tabella `professional_interests`).

4.  **Flusso Amministrativo**:
    - La route `admin.tsx` è riservata agli account con `app_metadata.role = 'admin'` su Supabase Auth (assegnato via migration `20260707100000_admin_role.sql`). Le funzioni amministrative sono protette lato server dal middleware `requireAdmin`.

5.  **Abbonamenti a livelli (Stripe Subscriptions)**:
    - Tre piani mensili ricorrenti per le famiglie, definiti in `src/lib/plans.ts`:

      | Piano | Prezzo | Contatti | Badge verifica | Video | Concierge |
      |---|---|---|---|---|---|
      | Base | 29,99€ | 5 | — | — | — |
      | Plus | 49,99€ | 20 | ✓ | ✓ | — |
      | Premium | 79,99€ | illimitati | ✓ | ✓ | ✓ |

    - Il checkout usa il Price ID del tier (`STRIPE_PRICE_BASE|PLUS|PREMIUM`). La **fonte di verità** è il webhook `/api/stripe-webhook`, che gestisce l'intero ciclo di vita: `checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.paid`, `invoice.payment_failed`. `createBillingPortalSession` apre il Customer Portal per disdette e metodi di pagamento.

6.  **Contatti e Chat**:
    - La famiglia "contatta" un professionista (`contactProfessional`): il server verifica il cap del piano, registra il contatto in `family_contacts` e apre una `conversations`. Solo dopo il contatto vengono svelati nome completo ed email.
    - Chat testuale in tempo reale (`/chat/$conversationId`): invio via server function autenticata, ricezione via **Supabase Realtime**. Le tabelle `conversations` e `messages` hanno **RLS reale**: solo i due partecipanti leggono.

7.  **Videochiamate (Daily.co)**:
    - Riservate ai piani Plus e Premium. `createVideoRoom` verifica partecipazione e piano, crea una stanza privata Daily e un token a scadenza; il video è **embedded** nella pagina (`VideoCall.tsx`), senza uscire dal sito.

8.  **Verifica approfondita professionisti**:
    - Il professionista carica casellario giudiziale, referenze e attestati (`/professionista/verifica-documenti`) in un bucket **privato** (`pro_documents`).
    - L'admin li rivede tramite signed URL e, approvandoli, imposta i badge `criminal_check_verified`, `references_verified`, `certificates_verified`.
    - Le famiglie Plus/Premium vedono **solo i badge**, mai i documenti (scelta deliberata: i dati giudiziari sono categoria particolare ex art. 10 GDPR).

9.  **Concierge (Premium)**:
    - L'admin cura una rosa (max 10) di professionisti per una famiglia Premium e ne "presenta" i migliori 3; la famiglia li vede nella sezione "Selezionati per te" con la nota del team.

## 4. Dipendenze Chiave

Il progetto sfrutta le seguenti librerie principali (evincibili dal `package.json`):

- **Framework & Build**:
  - `react`, `react-dom` (v19)
  - `vite`, `@cloudflare/vite-plugin`, `wrangler` (per il deployment serverless)
  - `@tanstack/react-router`, `@tanstack/react-start` (Routing SSR/SPA)
- **UI & Styling**:
  - `tailwindcss` (v4), `@tailwindcss/vite`
  - Ecosistema `@radix-ui/react-*` (Dialog, Popover, Select, ecc.)
  - `lucide-react` (Icone), `recharts` (Grafici), `embla-carousel-react` (Caroselli)
- **Gestione Stato & Form**:
  - `react-hook-form` + `zod` + `@hookform/resolvers` (Validazione form robusta)
  - `@tanstack/react-query` (Data fetching e caching)
- **Servizi Esterni & Backend**:
  - `@supabase/supabase-js` (Database & Auth)
  - `@google/genai` (Intelligenza Artificiale per l'OCR/Verifica documenti)
  - `stripe` (Gestione pagamenti/abbonamenti, indicato anche dai campi `has_active_package` nel DB)
  - `nodemailer` (Invio email)

## 5. Sicurezza

- **Autenticazione server-side**: ogni server function protetta usa il middleware `requireSupabaseAuth` (o `requireAdmin`): il client allega il token di sessione Supabase come header `Authorization: Bearer`, il server lo valida e deriva l'identità dell'utente dalla sessione — mai da ID passati dal client.
- **Autorizzazione**: le operazioni su dati utente verificano sempre l'ownership tramite `waitlist.auth_id` (helper `getOwnedWaitlistRecord` in `src/server/authz.ts`). Le funzioni amministrative richiedono `app_metadata.role = 'admin'`.
- **Service role key**: usata solo lato server (`client.server.ts`), letta esclusivamente da `SUPABASE_SERVICE_ROLE_KEY`. Non deve MAI comparire nel codice, nei log o nel bundle client.
- **Documenti**: bucket Storage privati (`identity_docs`, `pro_documents`); l'admin li visualizza tramite signed URL temporanei generati server-side. Mai esposti alle famiglie.
- **RLS**: `conversations` e `messages` hanno policy che limitano la lettura ai soli partecipanti (join su `waitlist.auth_id = auth.uid()`). Le altre tabelle applicative sono accessibili solo via service role dalle server function.
- **GDPR**: consenso provabile alla registrazione (privacy obbligatoria + marketing separato, con timestamp e versione policy), double opt-in via email, pagine legali in `/privacy`, `/cookie`, `/termini`.

## 6. Setup

1.  Copia `.env.example` in `.env` e compila tutte le variabili (Supabase, Stripe, Gemini, Daily, email).
2.  `pnpm install`
3.  Applica le migrations in `supabase/migrations/` (via `supabase db push` o SQL editor), in ordine cronologico.
4.  **Stripe**: crea 3 prodotti con prezzo **ricorrente mensile** (29,99 / 49,99 / 79,99 EUR) e metti i Price ID in `STRIPE_PRICE_BASE|PLUS|PREMIUM`. Abilita il **Customer Portal**.
5.  **Webhook Stripe**: endpoint `https://<dominio>/api/stripe-webhook` con gli eventi `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`; salva il signing secret in `STRIPE_WEBHOOK_SECRET`.
6.  **Supabase Auth**: attiva "Confirm email" e aggiungi `<dominio>/conferma-email` alle Redirect URLs.
7.  **Deploy Cloudflare**: imposta i secrets server-side con `wrangler secret put <NOME>` (tutti quelli di `.env.example`) e le build variables `VITE_SUPABASE_*` (servono al bundle client).
8.  Comandi: `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

> **Nota sulle chiavi Supabase**: il progetto supporta sia le chiavi legacy JWT (`eyJ...`) sia le nuove (`sb_publishable_...` / `sb_secret_...`). Se ruoti le chiavi, aggiornale **prima** ovunque (`.env` locale + secrets Cloudflare) e **solo dopo** disattiva le legacy, altrimenti il sito va offline.
