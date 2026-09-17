#!/usr/bin/env bash
# Carica su Cloudflare i secret di runtime leggendoli dal file .env locale.
#
#   bash scripts/cf-secrets.sh          # solo quelli necessari adesso
#   bash scripts/cf-secrets.sh --all    # anche Stripe e Daily (serviranno piu avanti)
#
# I valori passano da .env a wrangler tramite stdin: non vengono mai stampati
# a schermo, non finiscono nella cronologia della shell e non vengono scritti
# su disco. Il file .env e' gia' escluso da git.

set -u

cd "$(dirname "$0")/.." || exit 1

ENV_FILE=".env"

# Necessari per la fase di reclutamento professionisti.
BASE_VARS="GEMINI_API_KEY PASSWORD_APP EMAIL_MITTENTE EMAIL_DESTINATARIO"

# Servono solo quando si apre il lato famiglie (pagamenti e videochiamate).
EXTRA_VARS="STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET STRIPE_PRICE_BASE STRIPE_PRICE_PLUS STRIPE_PRICE_PREMIUM DAILY_API_KEY"

VARS="$BASE_VARS"
if [ "${1:-}" = "--all" ]; then
  VARS="$BASE_VARS $EXTRA_VARS"
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Errore: $ENV_FILE non trovato in $(pwd)" >&2
  exit 1
fi

echo "Verifico l'autenticazione Cloudflare..."
if ! npx wrangler whoami >/dev/null 2>&1; then
  echo >&2
  echo "Non sei autenticato su Cloudflare. Esegui prima:" >&2
  echo "    npx wrangler login" >&2
  exit 1
fi

# Legge una variabile da .env togliendo apici e spazi, senza stamparne il valore.
read_env() {
  sed -n "s/^$1=//p" "$ENV_FILE" \
    | head -n1 \
    | sed -e 's/\r$//' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' \
          -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'$/\1/"
}

ok=0
skipped=0
failed=0

for name in $VARS; do
  value="$(read_env "$name")"

  if [ -z "$value" ]; then
    echo "  saltata   $name (assente o vuota in $ENV_FILE)"
    skipped=$((skipped + 1))
    continue
  fi

  if printf '%s' "$value" | npx wrangler secret put "$name" >/dev/null 2>&1; then
    echo "  caricata  $name"
    ok=$((ok + 1))
  else
    echo "  FALLITA   $name"
    failed=$((failed + 1))
  fi
done

echo
echo "Fatto: $ok caricate, $skipped saltate, $failed fallite."

if [ "$failed" -gt 0 ]; then
  exit 1
fi
