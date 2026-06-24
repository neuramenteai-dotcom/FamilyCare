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
  score: number;
}) {
  const EMAIL_MITTENTE = process.env.EMAIL_MITTENTE;
  const PASSWORD_APP = process.env.PASSWORD_APP;
  const EMAIL_DESTINATARIO = process.env.EMAIL_DESTINATARIO || "familycareitalia@gmail.com";

  if (!EMAIL_MITTENTE || !PASSWORD_APP) {
    console.warn("⚠️ SMTP credentials missing (EMAIL_MITTENTE / PASSWORD_APP). Email notification skipped.");
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

  const subjectUser = data.userType === "famiglia"
    ? "Conferma Richiesta Assistenza - FamilyCare"
    : "Conferma Iscrizione Candidatura - FamilyCare";

  const subjectAdmin = data.userType === "famiglia"
    ? `🏠 Nuovo Lead Famiglia — ${data.full_name || "Anonimo"}`
    : `👩‍💼 Nuova Candidata — ${data.full_name || "Anonima"}`;

  // Content for User
  const textUser = data.userType === "famiglia"
    ? `Ciao ${data.full_name || ""},\n\nAbbiamo ricevuto la tua richiesta di assistenza per la zona ${data.city || ""}.\nTi contatteremo entro 2 ore su WhatsApp o via Email per presentarti i profili disponibili.\n\nGrazie,\nIl team di FamilyCare`
    : `Ciao ${data.full_name || ""},\n\nGrazie per esserti candidata su FamilyCare.\nAbbiamo ricevuto il tuo profilo e verificheremo i tuoi dati entro 48 ore. Ti contatteremo su WhatsApp al numero ${data.phone || ""} per il colloquio conoscitivo.\n\nUn cordiale saluto,\nIl team di FamilyCare`;

  // Content for Admin
  const textAdmin = `Nuovo iscritto registrato su FamilyCare!\n\n`
    + `Tipo: ${data.userType}\n`
    + `Nome: ${data.full_name || "—"}\n`
    + `Email: ${data.email}\n`
    + `Telefono: ${data.phone || "—"}\n`
    + `Città/Zona: ${data.city || "—"}${data.zona ? ` (${data.zona})` : ""}\n`
    + `Servizi richiesti/offerti: ${data.services ? data.services.join(", ") : "—"}\n`
    + `Esperienza: ${data.experience || "—"}\n`
    + `Score qualità: ${data.score}/100\n`
    + `Messaggio/Note: ${data.message || "—"}\n`;

  try {
    // 1. Send confirmation to the user who signs up
    await transporter.sendMail({
      from: `"FamilyCare" <${EMAIL_MITTENTE}>`,
      to: data.email,
      subject: subjectUser,
      text: textUser,
    });
    console.log(`✉️ Email di conferma inviata con successo all'utente: ${data.email}`);

    // 2. Send notification to admin (familycareitalia@gmail.com)
    await transporter.sendMail({
      from: `"FamilyCare App" <${EMAIL_MITTENTE}>`,
      to: EMAIL_DESTINATARIO,
      subject: subjectAdmin,
      text: textAdmin,
    });
    console.log(`✉️ Notifica email inviata con successo all'admin: ${EMAIL_DESTINATARIO}`);
  } catch (error) {
    console.error("❌ Errore durante l'invio delle email:", error);
  }
}
