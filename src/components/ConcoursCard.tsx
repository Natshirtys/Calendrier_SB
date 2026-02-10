import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Concours } from '../types/concours';
import { TYPE_CONCOURS_LABELS } from '../types/concours';
import styles from './ConcoursCard.module.css';

interface Props {
  concours: Concours;
}

export default function ConcoursCard({ concours }: Props) {
  const dateObj = new Date(concours.date + 'T00:00:00');
  const dateFormatted = format(dateObj, 'EEEE d MMMM yyyy', { locale: fr });

  return (
    <Link to={`/concours/${concours.id}`} className={styles.card}>
      <div className={styles.dateStrip}>
        <span className={styles.day}>{format(dateObj, 'd')}</span>
        <span className={styles.month}>{format(dateObj, 'MMM', { locale: fr })}</span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{concours.titre}</h3>
        <div className={styles.meta}>
          <span className={styles.badge}>{TYPE_CONCOURS_LABELS[concours.type]}</span>
          {concours.categorie && <span className={styles.categorie}>{concours.categorie}</span>}
        </div>
        <p className={styles.info}>
          {concours.lieu.nom} — {concours.lieu.ville}
        </p>
        <p className={styles.info}>
          {dateFormatted} · {concours.heureDebut}
        </p>
        {concours.dotation && (
          <p className={styles.dotation}>{concours.dotation}</p>
        )}
      </div>
    </Link>
  );
}
