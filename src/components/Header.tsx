import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <img
          src="/images/logo-cbda-mini.jpg"
          alt="Logo du Comité Bouliste de l'Allier"
          className={styles.logo}
        />
        <h1 className={styles.title}>Concours Boules Lyonnaises</h1>
      </div>
      <nav className={styles.nav}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          Liste
        </NavLink>
        <NavLink
          to="/calendrier"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          Calendrier
        </NavLink>
      </nav>
    </header>
  );
}
