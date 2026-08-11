import { useState, useCallback, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useConcours } from '../hooks/useConcours';
import type { Concours } from '../types/concours';
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

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function buildIcsContent(c: Concours): string {
  const date = c.date.replace(/-/g, '');
  const location = [c.lieu.nom, c.lieu.adresse, c.lieu.codePostal, c.lieu.ville].filter(Boolean).join(', ');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendrier CBDA//FR',
    'BEGIN:VEVENT',
    `UID:${c.id}@calendrier-cbda`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `SUMMARY:${escapeIcs(c.titre)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(c.description ?? '')}`,
  ];

  if (c.heureDebut) {
    const start = `${date}T${c.heureDebut.replace(':', '')}00`;
    const [hours, minutes] = c.heureDebut.split(':').map(Number);
    const end = `${date}T${String(Math.min(hours + 4, 23)).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;
    lines.push(`DTSTART:${start}`, `DTEND:${end}`);
  } else {
    const nextDay = new Date(`${c.date}T00:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);
    lines.push(`DTSTART;VALUE=DATE:${date}`, `DTEND;VALUE=DATE:${nextDay.toISOString().slice(0, 10).replace(/-/g, '')}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR', '');
  return lines.join('\r\n');
}

function downloadIcs(c: Concours) {
  const blob = new Blob([buildIcsContent(c)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `concours-${c.date}-${c.id}.ics`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ConcoursDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { getById, loading, error } = useConcours();
  const concours = getById(id!);
  const returnTarget = (location.state as { from?: { pathname: string; search?: string; label: string } } | null)?.from;
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
        <Link to={returnTarget ? { pathname: returnTarget.pathname, search: returnTarget.search } : '/'}>
          {returnTarget?.label ?? 'Retour à la liste'}
        </Link>
      </div>
    );
  }

  const dateObj = new Date(concours.date + 'T00:00:00');
  const dateFormatted = format(dateObj, 'EEEE d MMMM yyyy', { locale: fr });
  const isPdf = concours.affiche?.toLowerCase().endsWith('.pdf');
  const lieuLines = [concours.lieu.nom, concours.lieu.adresse, `${concours.lieu.codePostal} ${concours.lieu.ville}`.trim()]
    .filter(Boolean)
    .filter((line, index, lines) => lines.findIndex((other) => other.toLocaleLowerCase('fr') === line.toLocaleLowerCase('fr')) === index);

  return (
    <div className={styles.detail}>
      <Link to={returnTarget ? { pathname: returnTarget.pathname, search: returnTarget.search } : '/'} className={styles.back}>
        &larr; {returnTarget?.label ?? 'Retour à la liste'}
      </Link>

      <h2 className={styles.title}>{concours.titre}</h2>

      <div className={styles.badges}>
        <span className={styles.badge} style={concours.couleur ? { backgroundColor: concours.couleur } : undefined}>
          {concours.typeCompetition ?? 'Type non renseigné'}
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
            <div className={styles.calendarActions}>
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
            <button type="button" className={styles.gcalBtn} onClick={() => downloadIcs(concours)}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="currentColor" d="M16.67 13.13c-.02-2.18 1.78-3.23 1.86-3.28-1.02-1.49-2.6-1.69-3.16-1.71-1.33-.14-2.63.8-3.31.8-.69 0-1.73-.78-2.86-.76-1.47.02-2.85.87-3.61 2.18-1.57 2.71-.4 6.7 1.1 8.89.75 1.07 1.62 2.27 2.76 2.23 1.12-.05 1.54-.71 2.89-.71 1.34 0 1.74.71 2.9.68 1.2-.02 1.96-1.08 2.68-2.16.86-1.23 1.2-2.45 1.22-2.51-.03-.01-2.44-.93-2.47-3.65ZM14.51 6.73c.6-.75 1.01-1.77.9-2.8-.87.04-1.96.6-2.59 1.33-.56.65-1.06 1.71-.94 2.69.98.07 1.99-.5 2.63-1.22Z"/>
              </svg>
              Ajouter au calendrier Apple / iOS
            </button>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Lieu</h3>
            {lieuLines.map((line, index) => (
              <p key={line} className={index === 0 ? styles.lieuNom : undefined}>{line}</p>
            ))}
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

          {(concours.arbitres?.length || concours.delegues?.length) && (
            <section className={styles.section}>
              <h3>Officiels</h3>
              {concours.arbitres?.length && <p><strong>Arbitre{concours.arbitres.length > 1 ? 's' : ''} : </strong>{concours.arbitres.join(', ')}</p>}
              {concours.delegues?.length && <p><strong>Délégué{concours.delegues.length > 1 ? 's' : ''} : </strong>{concours.delegues.join(', ')}</p>}
            </section>
          )}

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
