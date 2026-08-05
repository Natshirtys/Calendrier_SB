import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useConcours } from '../hooks/useConcours';
import type { Concours } from '../types/concours';
import { TYPE_CONCOURS_LABELS } from '../types/concours';
import styles from './ConcoursDetail.module.css';

function buildGoogleCalendarUrl(c: Concours): string {
  const d = c.date.replace(/-/g, '');
  let dates: string;
  if (c.heureDebut) {
    const start = `${d}T${c.heureDebut.replace(':', '')}00`;
    if (c.heureFin) {
      dates = `${start}/${d}T${c.heureFin.replace(':', '')}00`;
    } else {
      const [h, m] = c.heureDebut.split(':').map(Number);
      const endH = String(Math.min(h + 4, 23)).padStart(2, '0');
      const endM = String(m).padStart(2, '0');
      dates = `${start}/${d}T${endH}${endM}00`;
    }
  } else {
    const next = new Date(c.date + 'T00:00:00');
    next.setDate(next.getDate() + 1);
    dates = `${d}/${next.toISOString().slice(0, 10).replace(/-/g, '')}`;
  }
  const location = [c.lieu.nom, c.lieu.ville].filter(Boolean).join(', ');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: c.titre,
    dates,
    location,
    details: c.description ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function ConcoursDetail() {
  const { id } = useParams<{ id: string }>();
  const { getById, loading, error } = useConcours();
  const concours = getById(id!);
  const [lightbox, setLightbox] = useState(false);

  const closeLightbox = useCallback(() => setLightbox(false), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox, closeLightbox]);

  if (loading) {
    return <div className={styles.notFound}>Chargement du concours…</div>;
  }

  if (!concours) {
    return (
      <div className={styles.notFound}>
        <h2>{error ? 'Calendrier indisponible' : 'Concours introuvable'}</h2>
        {error && <p>{error}</p>}
        <Link to="/">Retour à la liste</Link>
      </div>
    );
  }

  const dateObj = new Date(concours.date + 'T00:00:00');
  const dateFormatted = format(dateObj, 'EEEE d MMMM yyyy', { locale: fr });
  const isPdf = concours.affiche?.toLowerCase().endsWith('.pdf');

  return (
    <div className={styles.detail}>
      <Link to="/" className={styles.back}>&larr; Retour à la liste</Link>

      <h2 className={styles.title}>{concours.titre}</h2>

      <div className={styles.badges}>
        <span className={styles.badge} style={concours.couleur ? { backgroundColor: concours.couleur } : undefined}>
          {TYPE_CONCOURS_LABELS[concours.type]}
        </span>
        {concours.categorie && <span className={styles.badgeSecondary}>{concours.categorie}</span>}
      </div>

      {concours.organisateur && (
        <p className={styles.organisateur}>Organisé par {concours.organisateur}</p>
      )}

      <div className={concours.affiche ? styles.layout : undefined}>
        {concours.affiche && (
          <aside className={styles.afficheSide}>
            {isPdf ? (
              <object
                data={concours.affiche}
                type="application/pdf"
                className={styles.affichePdf}
              >
                <p>
                  Impossible d'afficher le PDF.{' '}
                  <a href={concours.affiche} target="_blank" rel="noopener noreferrer">
                    Télécharger l'affiche
                  </a>
                </p>
              </object>
            ) : (
              <img
                src={concours.affiche}
                alt="Affiche du concours"
                className={styles.affiche}
                onClick={() => setLightbox(true)}
              />
            )}
          </aside>
        )}

        <div className={styles.sections}>
          <section className={styles.section}>
            <h3>Date et horaires</h3>
            <p style={{ textTransform: 'capitalize' }}>{dateFormatted}</p>
            <p>
              Début : {concours.heureDebut}
              {concours.heureFin && ` — Fin : ${concours.heureFin}`}
            </p>
            <a
              href={buildGoogleCalendarUrl(concours)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.gcalBtn}
              title="Ajouter à Google Calendar"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                <path fill="#34A853" d="M7 11h2v2H7z"/>
                <path fill="#FBBC04" d="M11 11h2v2h-2z"/>
                <path fill="#EA4335" d="M15 11h2v2h-2z"/>
                <path fill="#34A853" d="M7 15h2v2H7z"/>
                <path fill="#4285F4" d="M11 15h2v2h-2z"/>
              </svg>
              Ajouter à Google Calendar
            </a>
          </section>

          <section className={styles.section}>
            <h3>Lieu</h3>
            <p className={styles.lieuNom}>{concours.lieu.nom}</p>
            <p>{concours.lieu.adresse}</p>
            <p>{concours.lieu.codePostal} {concours.lieu.ville}</p>
          </section>

          <section className={styles.section}>
            <h3>Contact</h3>
            <p>{concours.contact.nom}</p>
            {concours.contact.telephone && (
              <p>
                <a href={`tel:${concours.contact.telephone}`}>{concours.contact.telephone}</a>
              </p>
            )}
            {concours.contact.email && (
              <p>
                <a href={`mailto:${concours.contact.email}`}>{concours.contact.email}</a>
              </p>
            )}
          </section>

          {concours.inscription && (
            <section className={styles.section}>
              <h3>Inscription</h3>
              {concours.inscription.prix !== undefined && (
                <p>Prix : {concours.inscription.prix}€ par équipe</p>
              )}
              {concours.inscription.dateLimite && (
                <p>
                  Date limite :{' '}
                  {format(new Date(concours.inscription.dateLimite + 'T00:00:00'), 'd MMMM yyyy', {
                    locale: fr,
                  })}
                </p>
              )}
              {concours.inscription.lienInscription && (
                <p>
                  <a
                    href={concours.inscription.lienInscription}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    S'inscrire en ligne
                  </a>
                </p>
              )}
            </section>
          )}

          {(concours.dotation || concours.nombreEquipesMax) && (
            <section className={styles.section}>
              <h3>Informations complémentaires</h3>
              {concours.dotation && <p>Dotation : {concours.dotation}</p>}
              {concours.nombreEquipesMax && (
                <p>Nombre d'équipes max : {concours.nombreEquipesMax}</p>
              )}
            </section>
          )}

          {concours.description && (
            <section className={styles.section}>
              <h3>Description</h3>
              <p>{concours.description}</p>
            </section>
          )}
        </div>
      </div>
      {lightbox && concours.affiche && !isPdf && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <button className={styles.lightboxClose} onClick={closeLightbox}>&times;</button>
          <img
            src={concours.affiche}
            alt="Affiche du concours"
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
