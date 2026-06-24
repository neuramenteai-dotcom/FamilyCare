import badanteImg from "@/assets/service-badante.jpg";
import colfImg from "@/assets/service-colf.jpg";
import dogsitterImg from "@/assets/service-dogsitter.jpg";
import babysitterImg from "@/assets/service-babysitter.jpg";
import tutorImg from "@/assets/service-tutor.jpg";

export type Service = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  priceFrom: string;
  available: string;
  image: string;
  features: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "babysitter",
    name: "Babysitter",
    tagline: "Cura attenta per i tuoi bambini",
    description:
      "Babysitter selezionate con esperienza con neonati, bambini e ragazzi. Anche prima infanzia, doposcuola e weekend.",
    priceFrom: "€8",
    available: "+1.200 in Italia",
    image: babysitterImg,
    features: ["Esperienza certificata", "Pronto soccorso pediatrico", "Lingue straniere"],
  },
  {
    slug: "badanti",
    name: "Collaboratrici domestiche",
    tagline: "Assistenza dignitosa per chi ami",
    description:
      "Assistenti familiari per anziani e persone non autosufficienti, conviventi o a ore. Esperienza con Alzheimer e Parkinson.",
    priceFrom: "€9",
    available: "+800 in Italia",
    image: badanteImg,
    features: ["OSS / OSA qualificati", "Convivenza o orario", "Contratto CCNL incluso"],
  },
  {
    slug: "colf",
    name: "Colf",
    tagline: "La tua casa, sempre in ordine",
    description:
      "Collaboratrici domestiche per pulizie, stiro, spesa e gestione casa. Una tantum o continuative.",
    priceFrom: "€10",
    available: "+1.500 in Italia",
    image: colfImg,
    features: ["Referenze verificate", "Prodotti professionali", "Massima discrezione"],
  },
  {
    slug: "dogsitter",
    name: "Dog sitter",
    tagline: "Coccole e passeggiate per il tuo amico a 4 zampe",
    description:
      "Dog sitter affidabili per passeggiate, pet visit e weekend. Anche per cani con esigenze speciali.",
    priceFrom: "€7",
    available: "+600 in Italia",
    image: dogsitterImg,
    features: ["Educatori cinofili", "Foto e GPS in tempo reale", "Assicurazione inclusa"],
  },
  {
    slug: "tutor",
    name: "Tutor scolastici",
    tagline: "Voti su, stress giù",
    description:
      "Tutor universitari e insegnanti per ogni materia, dalle elementari al liceo. In presenza o online.",
    priceFrom: "€12",
    available: "+900 in Italia",
    image: tutorImg,
    features: ["Tutte le materie", "Anche DSA / BES", "Online o a domicilio"],
  },
];
