import nodemailer from "nodemailer";

export async function sendEmailNotification(data: {
  email: string;
  full_name?: string;
  userType: "famiglia" | "professionista";
  city?: string;
  phone?: string;
  services?: string[];
  message?: string;
  zona?: string;
  experience?: string;
  italian_level?: string;
  nationality?: string;
  birth_date?: string;
  gender?: string;
  video_url?: string;
  score: number;
}) {
  const EMAIL_MITTENTE = process.env.EMAIL_MITTENTE;
  const PASSWORD_APP = process.env.PASSWORD_APP;
  const EMAIL_DESTINATARIO = process.env.EMAIL_DESTINATARIO || "familycareitalia@gmail.com";

  if (!EMAIL_MITTENTE || !PASSWORD_APP) {
    console.warn(
      "⚠️ SMTP credentials missing (EMAIL_MITTENTE / PASSWORD_APP). Email notification skipped.",
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_MITTENTE,
      pass: PASSWORD_APP,
    },
  });

  const subjectUser =
    data.userType === "famiglia"
      ? "Iscrizione ricevuta — FamilyCare"
      : "Iscrizione ricevuta — FamilyCare";

  const subjectAdmin =
    data.userType === "famiglia"
      ? `🏠 Nuovo Lead Famiglia — ${data.full_name || "Anonimo"}`
      : `👩‍💼 Nuova Candidata — ${data.full_name || "Anonima"}`;

  // Testo per l'utente.
  // Nessuna promessa di tempi, nessun contatto WhatsApp (non e' un canale che
  // usiamo e non e' stato consentito), nessun riferimento a profili disponibili
  // o a colloqui che non facciamo: si dichiara solo cio' che accade davvero.
  const nome = (data.full_name || "").trim();
  const saluto = nome ? `Ciao ${nome},` : "Ciao,";
  const dove = (data.city || "").trim();

  const textUser =
    data.userType === "famiglia"
      ? `${saluto}

grazie per esserti iscritto a FamilyCare.

FamilyCare è in fase di avvio: stiamo selezionando i primi professionisti verificati, a partire da Roma. Ti scriviamo a questo indirizzo appena ci saranno profili${dove ? ` nella zona di ${dove}` : ""}.

Nel frattempo non devi fare nulla e non ti viene chiesto alcun pagamento.

A presto,
Il team di FamilyCare`
      : `${saluto}

grazie per esserti iscritto a FamilyCare. Abbiamo ricevuto il tuo profilo.

Prima che diventi visibile alle famiglie, il nostro team verifica il tuo documento d'identità. Ti scriviamo a questo indirizzo quando la verifica è completata, oppure se ci serve qualcosa in più.

L'iscrizione è gratuita e FamilyCare non trattiene commissioni sul rapporto tra te e la famiglia.

A presto,
Il team di FamilyCare`;

  // Content for Admin
  const textAdmin =
    `Nuovo iscritto registrato su FamilyCare!\n\n` +
    `Tipo: ${data.userType}\n` +
    `Nome: ${data.full_name || "—"}\n` +
    `Email: ${data.email}\n` +
    `Telefono: ${data.phone || "—"}\n` +
    `Città/Zona: ${data.city || "—"}${data.zona ? ` (${data.zona})` : ""}\n` +
    `Servizi richiesti/offerti: ${data.services ? data.services.join(", ") : "—"}\n` +
    `Esperienza: ${data.experience || "—"}\n` +
    `Score qualità: ${data.score}/100\n` +
    `Messaggio/Note: ${data.message || "—"}\n`;

  try {
    // 1. Send confirmation to the user who signs up
    await transporter.sendMail({
      from: `"FamilyCare" <${EMAIL_MITTENTE}>`,
      to: data.email,
      subject: subjectUser,
      text: textUser,
      html: textUser.replace(/\n/g, "<br>"),
    });
    console.log(`✉️ Email di conferma inviata con successo all'utente: ${data.email}`);

    // 2. Send notification to admin (familycareitalia@gmail.com)
    await transporter.sendMail({
      from: `"FamilyCare App" <${EMAIL_MITTENTE}>`,
      to: EMAIL_DESTINATARIO,
      subject: subjectAdmin,
      text: textAdmin,
      html: textAdmin.replace(/\n/g, "<br>"),
    });
    console.log(`✉️ Notifica email inviata con successo all'admin: ${EMAIL_DESTINATARIO}`);
  } catch (error) {
    console.error("❌ Errore durante l'invio delle email:", error);
  }
}

/**
 * Avvisa una famiglia che e' entrato un profilo corrispondente a una sua
 * ricerca salvata. Parte solo quando il profilo e' stato approvato da una
 * persona ed e' quindi gia' visibile: non anticipa mai la pubblicazione.
 */
export async function sendAvvisoRicercaSalvata(data: {
  email: string;
  nomeFamiglia?: string | null;
  nomeRicerca: string;
  citta: string;
  zona?: string | null;
}) {
  const EMAIL_MITTENTE = process.env.EMAIL_MITTENTE;
  const PASSWORD_APP = process.env.PASSWORD_APP;

  if (!EMAIL_MITTENTE || !PASSWORD_APP) {
    console.warn("Credenziali SMTP mancanti: avviso ricerca salvata non inviato.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: EMAIL_MITTENTE, pass: PASSWORD_APP },
  });

  const nome = (data.nomeFamiglia || "").trim();
  const saluto = nome ? `Ciao ${nome},` : "Ciao,";
  const dove = data.zona ? `${data.citta}, zona ${data.zona}` : data.citta;

  const testo = `${saluto}

è appena entrato un nuovo profilo verificato che corrisponde alla tua ricerca "${data.nomeRicerca}" (${dove}).

Puoi vederlo entrando nella tua area riservata su FamilyCare.

Ricevi questo messaggio perché hai una ricerca salvata attiva: puoi disattivarla in qualsiasi momento dalla stessa pagina.

A presto,
Il team di FamilyCare`;

  try {
    await transporter.sendMail({
      from: `"FamilyCare" <${EMAIL_MITTENTE}>`,
      to: data.email,
      subject: `Nuovo profilo per la tua ricerca "${data.nomeRicerca}" — FamilyCare`,
      text: testo,
    });
  } catch (err) {
    console.error("Invio avviso ricerca salvata fallito:", err);
  }
}
