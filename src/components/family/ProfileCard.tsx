import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, MessageCircle, Heart, PlayCircle } from "lucide-react";

export type FamilyProfile = {
  id: string;
  first_name: string;
  full_name: string | null;
  email: string | null;
  conversationId: string | null;
  contacted: boolean;
  likedByPro: boolean;
  age: number | null;
  nationality: string | null;
  experience: string | null;
  italian_level: string | null;
  services: string[] | null;
  city: string | null;
  gender: string | null;
  bio: string | null;
  video_url: string | null;
  avatar_url: string | null;
  badges: { criminal: boolean; references: boolean; certificates: boolean } | null;
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="font-medium">{label}:</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}

export function ProfileCard({
  pro,
  onContact,
  contacting,
}: {
  pro: FamilyProfile;
  onContact: (id: string) => void;
  contacting: boolean;
}) {
  const displayName = pro.contacted && pro.full_name ? pro.full_name : pro.first_name;
  return (
    <div className="bg-background rounded-3xl border border-border/60 p-6 shadow-sm flex flex-col relative overflow-hidden">
      {pro.likedByPro && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <Heart className="w-3 h-3 fill-current" /> Interessato a te
        </div>
      )}
      <div className="flex items-center gap-4 mb-4 mt-1">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-xl font-bold text-muted-foreground overflow-hidden shrink-0">
          {pro.avatar_url ? (
            <img src={pro.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            displayName.charAt(0)
          )}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{displayName}</h3>
          <p className="text-sm text-muted-foreground">{pro.city || "—"}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-sm flex-grow">
        <Field label="Età" value={pro.age != null ? `${pro.age} anni` : null} />
        <Field label="Sesso" value={pro.gender} />
        <Field label="Nazionalità" value={pro.nationality} />
        <Field label="Esperienza" value={pro.experience} />
        <Field label="Italiano" value={pro.italian_level} />
        <Field label="Servizi" value={(pro.services || []).join(", ") || null} />

        {pro.bio && (
          <div className="mt-3 p-3 bg-muted/30 rounded-xl">
            <p className="text-muted-foreground line-clamp-3 italic">"{pro.bio}"</p>
          </div>
        )}

        {pro.video_url && (
          <a
            href={pro.video_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-primary text-sm font-medium mt-2 hover:underline"
          >
            <PlayCircle className="w-4 h-4" /> Video di presentazione
          </a>
        )}

        {pro.badges && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {pro.badges.criminal && <VerifiedBadge label="Casellario verificato" />}
            {pro.badges.references && <VerifiedBadge label="Referenze verificate" />}
            {pro.badges.certificates && <VerifiedBadge label="Attestati verificati" />}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border/40">
        {pro.contacted && pro.conversationId ? (
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/chat/$conversationId" params={{ conversationId: pro.conversationId }}>
                <MessageCircle className="w-4 h-4 mr-2" /> Chatta
              </Link>
            </Button>
            {pro.email && (
              <a
                href={`mailto:${pro.email}`}
                className="block text-center text-xs text-muted-foreground hover:text-foreground"
              >
                {pro.email}
              </a>
            )}
          </div>
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => onContact(pro.id)}
            disabled={contacting}
          >
            {contacting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Contatta
          </Button>
        )}
      </div>
    </div>
  );
}

function VerifiedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 text-xs font-medium">
      <ShieldCheck className="w-3 h-3" /> {label}
    </span>
  );
}
