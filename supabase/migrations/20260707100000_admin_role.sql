-- Assegna il ruolo admin (app_metadata.role) all'account amministratore.
-- Idempotente: riapplicabile senza effetti collaterali. Se l'account non
-- esiste ancora in Auth, rieseguire questo script dopo la registrazione.
UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
WHERE email = 'familycareitalia@gmail.com';
