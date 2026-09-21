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
    tagline: "Babysitter affidabili, per ogni età",
    description:
      "Trova babysitter selezionate e con esperienza nella cura di neonati, bambini e ragazzi, per accompagnarli con attenzione e serenità nella quotidianità, dal gioco al doposcuola.",
    priceFrom: "€8",
    available: "A ore o continuativo",
    image: babysitterImg,
    features: [
      "Esperienza anche con la prima infanzia",
      "Doposcuola, weekend e occasioni speciali",
      "Identità verificata",
    ],
  },
  {
    slug: "badanti",
    name: "Collaboratrici domestiche",
    tagline: "Assistenza qualificata, vicino a te",
    description:
      "Assistenti familiari conviventi o a ore, con esperienza nella cura di anziani e persone non autosufficienti, anche con Alzheimer e Parkinson.",
    priceFrom: "€9",
    available: "Convivenza o a ore",
    image: badanteImg,
    features: [
      "Convivenza o a ore",
      "Esperienza con persone non autosufficienti",
      "Identità verificata",
    ],
  },
  {
    slug: "colf",
    name: "Colf",
    tagline: "Una mano in più, ogni giorno",
    description: "Collaboratrici domestiche selezionate per aiutarti nella gestione della casa.",
    priceFrom: "€10",
    available: "Una tantum o fissa",
    image: colfImg,
    features: ["Servizio continuativo o una tantum", "Gestione della casa", "Identità verificata"],
  },
  {
    slug: "dogsitter",
    name: "Dog sitter",
    tagline: "Coccole e passeggiate per il tuo amico a 4 zampe",
    description:
      "Persone affidabili che si prendono cura del tuo cane quando non puoi farlo tu, con passeggiate, visite a domicilio e assistenza anche nei weekend.",
    priceFrom: "€7",
    available: "Passeggiate e pet visit",
    image: dogsitterImg,
    features: [
      "Passeggiate e visite a domicilio",
      "Assistenza personalizzata anche per esigenze particolari",
      "Identità verificata",
    ],
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
