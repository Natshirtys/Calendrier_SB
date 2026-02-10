export type TypeConcours =
  | 'doublette'
  | 'triplette'
  | 'quadrette'
  | 'tir_precision'
  | 'individuel'
  | 'autre';

export const TYPE_CONCOURS_LABELS: Record<TypeConcours, string> = {
  doublette: 'Doublette',
  triplette: 'Triplette',
  quadrette: 'Quadrette',
  tir_precision: 'Tir de précision',
  individuel: 'Individuel',
  autre: 'Autre',
};

export interface Lieu {
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  coordonnees?: { lat: number; lng: number };
}

export interface Contact {
  nom: string;
  telephone?: string;
  email?: string;
}

export interface Inscription {
  prix?: number;
  dateLimite?: string;
  lienInscription?: string;
}

export interface Concours {
  id: string;
  titre: string;
  type: TypeConcours;
  date: string;
  heureDebut: string;
  heureFin?: string;
  lieu: Lieu;
  contact: Contact;
  affiche?: string;
  description?: string;
  inscription?: Inscription;
  categorie?: string;
  dotation?: string;
  nombreEquipesMax?: number;
  organisateur?: string;
}
