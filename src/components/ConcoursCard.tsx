import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Concours } from '../types/concours';
import styles from './ConcoursCard.module.css';

interface Props {
  concours: Concours;
  compact?: boolean;
}

export default function ConcoursCard({ concours, compact = false }: Props) {
  const dateObj = new Date(concours.date + 'T00:00:00');
  const dateFormatted = format(dateObj, 'EEEE d MMMM yyyy', { locale: fr });
  const lieu = [concours.lieu.nom, concours.lieu.ville]
    .filter(
      (value, index, values) =>
        value && values.findIndex((other) => other.toLocaleLowerCase('fr') === value.toLocaleLowerCase('fr')) === index,
    )
    .join(' — ');

  const normalizeLabel = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
  const organisateur = concours.organisateur?.trim();
  const organiserIsDifferentFromLieu = organisateur && ![concours.lieu.nom, concours.lieu.ville]
    .filter(Boolean)
    .some((place) => normalizeLabel(place) === normalizeLabel(organisateur));

  return (
    <Link to={`/concours/${concours.id}`} className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <div className={styles.dateStrip}>
        <span className={styles.day}>{format(dateObj, 'd')}</span>
        <span className={styles.month}>{format(dateObj, 'MMM', { locale: fr })}</span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{concours.titre}</h3>
        <div className={styles.meta}>
          <span className={styles.badge} style={concours.couleur ? { backgroundColor: concours.couleur } : undefined}>
            {concours.typeCompetition ?? 'Type non renseigné'}
          </span>
          {concours.categorie && <span className={styles.categorie}>{concours.categorie}</span>}
        </div>
        <p className={styles.info}>{lieu}</p>
        {organiserIsDifferentFromLieu && <p className={styles.organisateur}>Organisé par {organisateur}</p>}
        <p className={styles.info}>
          {dateFormatted} · {concours.heureDebut}
        </p>
        {concours.dotation && <p className={styles.dotation}>{concours.dotation}</p>}
      </div>
    </Link>
  );
}
