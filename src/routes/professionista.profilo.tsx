import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Upload, UserRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile, updateMyProfile } from "@/functions/dashboard.functions";

export const Route = createFileRoute("/professionista/profilo")({
  component: ProProfilo,
});

function ProProfilo() {
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [proId, setProId] = useState<string | null>(null);

  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [gender, setGender] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    async function load() {
      const { data: authSession } = await supabase.auth.getSession();
      if (!authSession.session) {
        navigate({ to: "/login" });
        return;
      }

      const res = await fetchProfile();
      if (res.success && res.profile) {
        setProId(res.profile.id);
        setBio(res.profile.bio || "");
        setAvatarUrl(res.profile.avatar_url || null);
        setGender(res.profile.gender || "");
        setVideoUrl(res.profile.video_url || "");
      }
      setLoading(false);
    }
    load();
  }, [navigate, fetchProfile]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !proId) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${proId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(publicUrlData.publicUrl);
    } catch (error: any) {
      toast.error("Errore nel caricamento immagine: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!proId) return;
    setSaving(true);
    try {
      const res = await saveProfile({
        data: { bio, avatar_url: avatarUrl, gender, video_url: videoUrl },
      });
      if (!res.success) throw new Error(res.error);
      toast.success("Profilo aggiornato con successo!");
      navigate({ to: "/professionista/dashboard" });
    } catch (error: any) {
      toast.error("Errore nel salvataggio: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      <header className="bg-background border-b border-border/40 sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/professionista/dashboard" })}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Logo />
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-semibold mb-8">Il tuo Profilo</h1>

        <div className="bg-background rounded-3xl border border-border/60 p-8 shadow-sm space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-background shadow-md flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserRound className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-3 rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-transform hover:scale-105">
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg">Foto Profilo</h3>
              <p className="text-sm text-muted-foreground">
                Le famiglie si fidano di più se possono vederti.
              </p>
            </div>
          </div>

          <hr className="border-border/40" />

          {/* Bio Section */}
          <div className="space-y-3">
            <label className="font-medium text-lg flex items-center justify-between">
              Presentazione (Bio)
              <span className="text-sm font-normal text-muted-foreground">Opzionale</span>
            </label>
            <p className="text-sm text-muted-foreground mb-2">
              Scrivi due righe su di te, perché ami questo lavoro e cosa ti distingue.
            </p>
            <Textarea
              placeholder="Es. Sono una persona solare e paziente, ho 10 anni di esperienza con gli anziani..."
              className="min-h-[150px] resize-none text-base p-4 rounded-xl"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <hr className="border-border/40" />

          {/* Sesso */}
          <div className="space-y-3">
            <label className="font-medium text-lg">Sesso</label>
            <select
              className="w-full h-12 rounded-xl border border-input bg-background px-4 text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Preferisco non indicarlo</option>
              <option value="Donna">Donna</option>
              <option value="Uomo">Uomo</option>
              <option value="Altro">Altro</option>
            </select>
          </div>

          {/* Video di presentazione */}
          <div className="space-y-3">
            <label className="font-medium text-lg flex items-center justify-between">
              Video di presentazione
              <span className="text-sm font-normal text-muted-foreground">Opzionale</span>
            </label>
            <p className="text-sm text-muted-foreground mb-2">
              Incolla il link a un tuo breve video (YouTube o Vimeo). Le famiglie si fidano molto di
              più di chi possono vedere e ascoltare.
            </p>
            <Input
              type="url"
              placeholder="https://youtube.com/..."
              className="h-12 rounded-xl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          <div className="pt-4 space-y-3">
            <Button
              size="lg"
              className="w-full rounded-xl h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft"
              onClick={handleSave}
              disabled={saving || uploading}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Salva Profilo
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-xl h-12"
              onClick={() => navigate({ to: "/professionista/verifica-documenti" })}
            >
              <ShieldCheck className="w-5 h-5 mr-2" /> Verifica approfondita (badge)
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
