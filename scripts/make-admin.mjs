// Concede il ruolo amministratore a un utente gia' registrato.
//
//   node scripts/make-admin.mjs tua@email.it
//
// Legge SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY dal .env locale e imposta
// app_metadata.role = "admin" sull'utente Auth corrispondente. La chiave non
// viene mai stampata.
//
// Prerequisito: l'account deve gia' esistere, quindi registrati prima sul sito.
// Dopo l'esecuzione serve un nuovo login: il ruolo viaggia dentro il token, e
// quello che hai in sessione e' stato emesso prima della modifica.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readEnv(name) {
  const raw = readFileSync(resolve(root, ".env"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line.startsWith(`${name}=`)) continue;
    return line
      .slice(name.length + 1)
      .trim()
      .replace(/^["'](.*)["']$/, "$1");
  }
  return null;
}

const email = process.argv[2];
if (!email) {
  console.error("Uso: node scripts/make-admin.mjs tua@email.it");
  process.exit(1);
}

const SUPABASE_URL = readEnv("SUPABASE_URL");
const SERVICE_KEY = readEnv("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Errore: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti nel .env");
  process.exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

console.log(`Cerco l'utente ${email}...`);

const listUrl = new URL(`${SUPABASE_URL}/auth/v1/admin/users`);
listUrl.searchParams.set("per_page", "1000");

const listRes = await fetch(listUrl, { headers });
if (!listRes.ok) {
  console.error(`Errore nella lettura degli utenti: HTTP ${listRes.status}`);
  console.error(await listRes.text());
  process.exit(1);
}

const { users = [] } = await listRes.json();
const user = users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());

if (!user) {
  console.error(`Nessun utente registrato con l'email ${email}.`);
  console.error("Registrati prima sul sito, poi rilancia questo script.");
  process.exit(1);
}

if (user.app_metadata?.role === "admin") {
  console.log(`${email} e' gia' amministratore. Niente da fare.`);
  process.exit(0);
}

const patchRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
  method: "PUT",
  headers,
  body: JSON.stringify({
    app_metadata: { ...(user.app_metadata || {}), role: "admin" },
  }),
});

if (!patchRes.ok) {
  console.error(`Errore nell'assegnazione del ruolo: HTTP ${patchRes.status}`);
  console.error(await patchRes.text());
  process.exit(1);
}

const updated = await patchRes.json();
const confirmed = updated.app_metadata?.role === "admin";

console.log(confirmed ? `Fatto: ${email} ora e' amministratore.` : "Risposta inattesa dal server.");
console.log("Esci e rientra dall'account: il ruolo viaggia dentro il token di sessione.");
process.exit(confirmed ? 0 : 1);
