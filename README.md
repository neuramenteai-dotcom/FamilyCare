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
    *   Esiste una route `admin.tsx` per la gestione interna della piattaforma, degli utenti e delle verifiche in sospeso.

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
