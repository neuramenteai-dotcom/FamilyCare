# NeuraMenteAI FamilyCare

## 1. Scopo Principale del Progetto
**FamilyCare** è una piattaforma web sviluppata per connettere **Famiglie** che necessitano di assistenza e **Professionisti** del settore caregiving (babysitter, badanti, tutor, ecc.).
L'applicazione gestisce un flusso completo che parte dalla lista d'attesa (waitlist) fino all'accesso a dashboard personalizzate in base al ruolo dell'utente. Una delle funzionalità distintive è il sistema di **Verifica dell'Identità basato sull'Intelligenza Artificiale**, che analizza i documenti caricati dagli utenti per prevenire frodi, e un sistema di **matching/interessi** in cui i professionisti possono esprimere preferenze (like/dislike) verso specifiche richieste delle famiglie.

## 2. Architettura

L'architettura del progetto è moderna e orientata al serverless, suddivisa in:

*   **Frontend**: Sviluppato in **React 19** con **Vite**. L'interfaccia utente è costruita utilizzando **Tailwind CSS v4** e un ricco set di componenti headless tramite **Radix UI** (in stile shadcn/ui). La navigazione è gestita dal potente e type-safe **TanStack Router**.
*   **Backend / Server-Side**: Utilizza **TanStack Start**, che permette di integrare funzioni server direttamente nel framework frontend. Il deployment è configurato per l'infrastruttura edge di **Cloudflare** (tramite Wrangler).
*   **Database e Autenticazione**: Il cuore dei dati e della gestione utenti è affidato a **Supabase** (PostgreSQL). Supabase gestisce le sessioni (Auth), i dati dell'applicazione (tramite PostgREST) e le regole di sicurezza (Row Level Security - RLS).

## 3. Flussi di Dati Principali

1.  **Iscrizione e Autenticazione (Waitlist & Auth)**:
    *   I nuovi utenti compilano il form selezionando il proprio ruolo (`famiglia` o `professionista`). I dati finiscono inizialmente nella tabella `waitlist`.
    *   Una volta creato un account vero e proprio, il record nella `waitlist` viene collegato all'utente di Supabase Auth tramite un `auth_id`.
    *   Sono presenti flussi completi per il login, il recupero e l'aggiornamento della password.

2.  **Verifica dell'Identità (AI Verification)**:
    *   L'utente carica una foto del proprio documento d'identità.
    *   L'immagine viene inviata al server (tramite `ai-verification.ts`).
    *   Il server interroga le API di **Google Gemini (GenAI)** per estrarre nome e cognome dal documento visivo.
    *   I dati estratti vengono confrontati con quelli dichiarati dall'utente (con calcolo di un indice di confidenza) per validare l'identità in modo automatizzato.

3.  **Dashboard e Matching**:
    *   **Famiglie**: Accedono a `famiglia.dashboard.tsx` per visualizzare i servizi o i professionisti.
    *   **Professionisti**: Accedono a `professionista.dashboard.tsx`. Possono scorrere i profili delle famiglie ed esprimere un interesse positivo (`like`) o negativo (`dislike`), che viene salvato nel database nella tabella `professional_interests`.

4.  **Flusso Amministrativo**:
    *   La route `admin.tsx` è riservata agli account con `app_metadata.role = 'admin'` su Supabase Auth (assegnato via migration `20260707100000_admin_role.sql`). Le funzioni amministrative sono protette lato server dal middleware `requireAdmin`.

5.  **Pagamenti (Stripe)**:
    *   Le famiglie attivano il pacchetto tramite Stripe Checkout. La fonte di verità per l'attivazione è il webhook `/api/stripe-webhook` (evento `checkout.session.completed`, firma verificata con `STRIPE_WEBHOOK_SECRET`); `verifyCheckoutSession` fornisce solo la conferma immediata in UI dopo il redirect.

## 4. Dipendenze Chiave

Il progetto sfrutta le seguenti librerie principali (evincibili dal `package.json`):

*   **Framework & Build**:
    *   `react`, `react-dom` (v19)
    *   `vite`, `@cloudflare/vite-plugin`, `wrangler` (per il deployment serverless)
    *   `@tanstack/react-router`, `@tanstack/react-start` (Routing SSR/SPA)
*   **UI & Styling**:
    *   `tailwindcss` (v4), `@tailwindcss/vite`
    *   Ecosistema `@radix-ui/react-*` (Dialog, Popover, Select, ecc.)
    *   `lucide-react` (Icone), `recharts` (Grafici), `embla-carousel-react` (Caroselli)
*   **Gestione Stato & Form**:
    *   `react-hook-form` + `zod` + `@hookform/resolvers` (Validazione form robusta)
    *   `@tanstack/react-query` (Data fetching e caching)
*   **Servizi Esterni & Backend**:
    *   `@supabase/supabase-js` (Database & Auth)
    *   `@google/genai` (Intelligenza Artificiale per l'OCR/Verifica documenti)
    *   `stripe` (Gestione pagamenti/abbonamenti, indicato anche dai campi `has_active_package` nel DB)
    *   `nodemailer` (Invio email)

## 5. Sicurezza

*   **Autenticazione server-side**: ogni server function protetta usa il middleware `requireSupabaseAuth` (o `requireAdmin`): il client allega il token di sessione Supabase come header `Authorization: Bearer`, il server lo valida e deriva l'identità dell'utente dalla sessione — mai da ID passati dal client.
*   **Autorizzazione**: le operazioni su dati utente verificano sempre l'ownership tramite `waitlist.auth_id` (helper `getOwnedWaitlistRecord` in `src/server/authz.ts`). Le funzioni amministrative richiedono `app_metadata.role = 'admin'`.
*   **Service role key**: usata solo lato server (`client.server.ts`), letta esclusivamente da `SUPABASE_SERVICE_ROLE_KEY`. Non deve MAI comparire nel codice, nei log o nel bundle client.
*   **Documenti d'identità**: bucket Storage privato (`identity_docs`); l'admin li visualizza tramite signed URL temporanei generati server-side.

## 6. Setup

1.  Copia `.env.example` in `.env` e compila tutte le variabili (Supabase, Stripe, Gemini, email).
2.  `pnpm install`
3.  Applica le migrations in `supabase/migrations/` (via `supabase db push` o SQL editor).
4.  Configura il webhook Stripe: endpoint `https://<dominio>/api/stripe-webhook`, evento `checkout.session.completed`, e salva il signing secret in `STRIPE_WEBHOOK_SECRET`.
5.  Per il deploy su Cloudflare, imposta i secrets server-side con `wrangler secret put <NOME>`.
6.  Comandi: `pnpm dev` (sviluppo), `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
