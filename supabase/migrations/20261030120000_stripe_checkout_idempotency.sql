-- Registra ogni sessione Checkout applicata e concede l'accesso nella stessa
-- transazione. Webhook duplicati e redirect concorrenti non possono estendere
-- due volte lo stesso acquisto.

CREATE TABLE IF NOT EXISTS public.family_access_payments (
  checkout_session_id TEXT PRIMARY KEY,
  payment_intent_id TEXT UNIQUE,
  family_id UUID NOT NULL REFERENCES public.waitlist(id) ON DELETE RESTRICT,
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('base', 'plus')),
  amount_total INTEGER NOT NULL CHECK (amount_total > 0),
  currency TEXT NOT NULL CHECK (currency = 'eur'),
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  access_starts_at TIMESTAMPTZ NOT NULL,
  access_expires_at TIMESTAMPTZ NOT NULL,
  CHECK (access_expires_at > access_starts_at)
);

ALTER TABLE public.family_access_payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.family_access_payments FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.family_access_payments TO service_role;

CREATE OR REPLACE FUNCTION public.grant_family_access_for_checkout(
  p_checkout_session_id TEXT,
  p_family_id UUID,
  p_tier TEXT,
  p_payment_intent_id TEXT,
  p_amount_total INTEGER,
  p_currency TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_existing public.family_access_payments%ROWTYPE;
  v_inserted_session_id TEXT;
  v_previous_expiry TIMESTAMPTZ;
  v_started_at TIMESTAMPTZ;
  v_expires_at TIMESTAMPTZ;
  v_now TIMESTAMPTZ := clock_timestamp();
BEGIN
  IF p_checkout_session_id IS NULL
     OR p_family_id IS NULL
     OR p_tier IS NULL
     OR p_tier NOT IN ('base', 'plus')
     OR p_currency IS NULL
     OR p_currency <> 'eur'
     OR p_amount_total IS NULL
     OR p_amount_total <= 0 THEN
    RAISE EXCEPTION 'Invalid paid checkout parameters';
  END IF;

  SELECT *
    INTO v_existing
    FROM public.family_access_payments
   WHERE checkout_session_id = p_checkout_session_id;

  IF FOUND THEN
    IF v_existing.family_id <> p_family_id
       OR v_existing.plan_tier <> p_tier
       OR v_existing.payment_intent_id IS DISTINCT FROM p_payment_intent_id
       OR v_existing.amount_total <> p_amount_total
       OR v_existing.currency <> p_currency THEN
      RAISE EXCEPTION 'Checkout session metadata does not match its recorded payment';
    END IF;
    RETURN FALSE;
  END IF;

  -- Blocca il record famiglia per serializzare acquisti distinti e preservare
  -- tutti i giorni residui. La riga viene rilasciata al termine della RPC.
  SELECT access_expires_at
    INTO v_previous_expiry
    FROM public.waitlist
   WHERE id = p_family_id
     AND user_type = 'famiglia'
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Family profile not found';
  END IF;

  v_started_at := GREATEST(COALESCE(v_previous_expiry, v_now), v_now);
  v_expires_at := v_started_at + INTERVAL '30 days';

  INSERT INTO public.family_access_payments (
    checkout_session_id,
    payment_intent_id,
    family_id,
    plan_tier,
    amount_total,
    currency,
    paid_at,
    access_starts_at,
    access_expires_at
  ) VALUES (
    p_checkout_session_id,
    p_payment_intent_id,
    p_family_id,
    p_tier,
    p_amount_total,
    p_currency,
    v_now,
    v_started_at,
    v_expires_at
  )
  ON CONFLICT (checkout_session_id) DO NOTHING
  RETURNING checkout_session_id INTO v_inserted_session_id;

  IF v_inserted_session_id IS NULL THEN
    SELECT *
      INTO v_existing
      FROM public.family_access_payments
     WHERE checkout_session_id = p_checkout_session_id;

    IF v_existing.family_id <> p_family_id
       OR v_existing.plan_tier <> p_tier
       OR v_existing.payment_intent_id IS DISTINCT FROM p_payment_intent_id
       OR v_existing.amount_total <> p_amount_total
       OR v_existing.currency <> p_currency THEN
      RAISE EXCEPTION 'Checkout session metadata does not match its recorded payment';
    END IF;
    RETURN FALSE;
  END IF;

  UPDATE public.waitlist
     SET plan_tier = p_tier,
         access_expires_at = v_expires_at,
         has_active_package = TRUE
   WHERE id = p_family_id;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_family_access_for_checkout(TEXT, UUID, TEXT, TEXT, INTEGER, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_family_access_for_checkout(TEXT, UUID, TEXT, TEXT, INTEGER, TEXT)
  TO service_role;
