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
    available: "A ore o continuativo",
    image: babysitterImg,
    features: ["Anche prima infanzia", "Doposcuola e weekend", "Identità verificata"],
  },
  {
    slug: "badanti",
    name: "Collaboratrici domestiche",
    tagline: "Assistenza dignitosa per chi ami",
    description:
      "Assistenti familiari per anziani e persone non autosufficienti, conviventi o a ore. Esperienza con Alzheimer e Parkinson.",
    priceFrom: "€9",
    available: "Convivenza o a ore",
    image: badanteImg,
    features: ["Convivenza o a ore", "Esperienza con non autosufficienti", "Identità verificata"],
  },
  {
    slug: "colf",
    name: "Colf",
    tagline: "La tua casa, sempre in ordine",
    description:
      "Collaboratrici domestiche per pulizie, stiro, spesa e gestione casa. Una tantum o continuative.",
    priceFrom: "€10",
    available: "Una tantum o fissa",
    image: colfImg,
    features: ["Pulizie, stiro e spesa", "Una tantum o continuativa", "Identità verificata"],
  },
  {
    slug: "dogsitter",
    name: "Dog sitter",
    tagline: "Coccole e passeggiate per il tuo amico a 4 zampe",
    description:
      "Dog sitter affidabili per passeggiate, pet visit e weekend. Anche per cani con esigenze speciali.",
    priceFrom: "€7",
    available: "Passeggiate e pet visit",
    image: dogsitterImg,
    features: ["Passeggiate e pet visit", "Anche esigenze speciali", "Identità verificata"],
  },
  {
    slug: "tutor",
    name: "Tutor scolastici",
    tagline: "Voti su, stress giù",
    description:
      "Tutor universitari e insegnanti per ogni materia, dalle elementari al liceo. In presenza o online.",
    priceFrom: "€12",
    available: "In presenza o online",
    image: tutorImg,
    features: ["Dalle elementari al liceo", "Online o a domicilio", "Identità verificata"],
  },
];
