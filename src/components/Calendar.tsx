import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useConcours } from '../hooks/useConcours';
import type { Concours } from '../types/concours';
import styles from './Calendar.module.css';

export default function Calendar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthFromUrl = searchParams.get('mois');
  const initialMonth = monthFromUrl && /^\d{4}-\d{2}$/.test(monthFromUrl)
    ? new Date(`${monthFromUrl}-01T00:00:00`)
    : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { allConcours } = useConcours();
  const navigate = useNavigate();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const concoursParJour = (date: Date) =>
    allConcours.filter((c) => isSameDay(new Date(c.date + 'T00:00:00'), date));
  const selectedEvents: Concours[] = selectedDate ? concoursParJour(selectedDate) : [];

  const changeMonth = (month: Date) => {
    setCurrentMonth(month);
    setSearchParams({ mois: format(month, 'yyyy-MM') }, { replace: true });
  };

  const openConcours = (id: string) => {
    const month = format(currentMonth, 'yyyy-MM');
    navigate(`/concours/${id}`, {
      state: {
        from: {
          pathname: '/calendrier',
          search: `?mois=${month}`,
          label: 'Retour au calendrier',
        },
      },
    });
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedDate(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  return (
    <div>
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={() => changeMonth(subMonths(currentMonth, 1))}>
          &larr;
        </button>
        <h2 className={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button className={styles.navBtn} onClick={() => changeMonth(addMonths(currentMonth, 1))}>
          &rarr;
        </button>
      </div>

      <div className={styles.weekDays}>
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
          <div key={d} className={styles.weekDay}>{d}</div>
        ))}
      </div>

      <div className={styles.grid}>
        {days.map((d, i) => {
          const events = concoursParJour(d);
          const inMonth = isSameMonth(d, currentMonth);
          const today = isToday(d);

          return (
            <div
              key={i}
              className={`${styles.cell} ${!inMonth ? styles.outside : ''} ${today ? styles.today : ''} ${events.length > 0 ? styles.hasEvents : ''}`}
              onClick={() => {
                if (events.length === 1) {
                  openConcours(events[0].id);
                } else if (events.length > 1) {
                  setSelectedDate(d);
                }
              }}
            >
              <span className={styles.dayNumber}>{format(d, 'd')}</span>
              {events.length > 0 && (
                <div className={styles.events}>
                  {events.map((e) => (
                    <div
                      key={e.id}
                      className={styles.eventDot}
                      title={e.titre}
                      style={e.couleur ? { backgroundColor: e.couleur } : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && selectedEvents.length > 1 && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDate(null)}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="events-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 id="events-title">
                {selectedEvents.length} compétitions le {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                aria-label="Fermer"
                onClick={() => setSelectedDate(null)}
              >
                ×
              </button>
            </div>
            <div className={styles.eventList}>
              {selectedEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className={styles.eventChoice}
                  onClick={() => {
                    setSelectedDate(null);
                    openConcours(event.id);
                  }}
                >
                  <span className={styles.eventChoiceTitle}>{event.titre}</span>
                  {event.typeCompetition && (
                    <span className={styles.eventChoiceType}>
                      <span
                        className={styles.eventChoiceDot}
                        style={event.couleur ? { backgroundColor: event.couleur } : undefined}
                      />
                      {event.typeCompetition}
                    </span>
                  )}
                  <span className={styles.eventChoiceMeta}>
                    {[event.heureDebut, event.lieu.nom, event.categorie].filter(Boolean).join(' · ')}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
