import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import styles from './Calendar.module.css';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  return (
    <div>
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          &larr;
        </button>
        <h2 className={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button className={styles.navBtn} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
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
                  navigate(`/concours/${events[0].id}`);
                } else if (events.length > 1) {
                  navigate(`/concours/${events[0].id}`);
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
    </div>
  );
}
