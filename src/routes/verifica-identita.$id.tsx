import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { uploadIdentityDocument } from "@/functions/upload.functions";
import { toast } from "sonner";
import { Loader2, ShieldCheck, UploadCloud, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/verifica-identita/$id")({
  component: IdentityVerificationPage,
});

function IdentityVerificationPage() {
  const { id } = Route.useParams();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [done, setDone] = useState(false);
  const uploadDoc = useServerFn(uploadIdentityDocument);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Seleziona un documento prima di continuare.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("waitlistId", id);
      formData.append("file", file);

      const res = await uploadDoc({ data: formData });
      
      if (res.success) {
        setDone(true);
        if (res.isMatch) {
          toast.success("Verifica AI completata con successo!");
        } else {
          toast.success("Documento inviato per la revisione manuale.");
        }
      } else {
        toast.error(res.error || "Errore durante l'invio.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Errore di rete.");
    } finally {
      setIsUploading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Documento Inviato!</h1>
        <p className="text-lg text-gray-600 max-w-md">
          Grazie per aver completato la verifica dell'identità. 
          Il nostro team revisionerà il tuo profilo al più presto e ti avviserà non appena sarà attivo.
        </p>
        <a href="/" className="mt-8 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
          Torna alla Home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifica la tua Identità</h2>
          <p className="text-gray-600">
            Per garantire la massima sicurezza alle famiglie, ti chiediamo di caricare una foto del tuo <b>Documento d'Identità</b> (fronte).
          </p>
        </div>

        <div className="space-y-6">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {file ? (
              <div className="text-primary font-medium flex flex-col items-center">
                <CheckCircle className="w-8 h-8 mb-2" />
                {file.name}
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                <span className="font-medium text-gray-700">Clicca per caricare</span>
                <span className="text-sm mt-1">Formati supportati: JPG, PNG, PDF</span>
              </div>
            )}
            <input 
              id="file-upload" 
              type="file" 
              accept="image/jpeg,image/png,application/pdf"
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Analisi in corso...
              </>
            ) : (
              "Verifica Documento"
            )}
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          I tuoi dati sono protetti e crittografati secondo le normative GDPR. Utilizziamo intelligenza artificiale per verificare l'autenticità dei documenti.
        </div>
      </div>
    </div>
  );
}
