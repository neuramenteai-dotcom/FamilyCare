-- ============================================================
-- Limiti sull'archivio "avatars"
-- ============================================================
-- Le foto profilo vengono caricate dal browser direttamente verso lo
-- storage: la policy consente a ogni utente autenticato di scrivere nel
-- bucket "avatars", che e' pubblico. Senza limiti sul bucket, chiunque
-- avesse un account poteva caricarci qualsiasi file, di qualsiasi tipo e
-- dimensione, e ottenerne un indirizzo pubblico - trasformando lo storage
-- del progetto in hosting di contenuti arbitrari (SVG o HTML con script
-- inclusi, serviti dal dominio dello storage).
--
-- I limiti vanno imposti sul bucket e non solo nel codice della pagina,
-- perche' l'API di storage e' raggiungibile anche senza passare da li'.

UPDATE storage.buckets
SET file_size_limit = 2097152, -- 2 MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'avatars';
