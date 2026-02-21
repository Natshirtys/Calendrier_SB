export type TypeConcours =
  | 'concours'
  | 'ch_regional_nm3'
  | 'ch_dep_as'
  | 'ch_dep_m4'
  | 'ch_dep'
  | 'ch_regional'
  | 'ch_regional_as'
  | 'ch_france'
  | 'fem_point'
  | 'veterans';

export const TYPE_CONCOURS_LABELS: Record<TypeConcours, string> = {
  concours: 'Concours',
  ch_regional_nm3: 'Ch. régional NM3',
  ch_dep_as: 'Chpt. dép. des A.S.',
  ch_dep_m4: 'Ch. départemental M4',
  ch_dep: 'Ch. départemental',
  ch_regional: 'Ch. régional',
  ch_regional_as: 'Ch. régional des A.S.',
  ch_france: 'Championnat de France',
  fem_point: "Fém'point",
  veterans: 'Vétérans',
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
