import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <a
          href="https://comitesportboulesdelallier.fr"
          className={styles.logoLink}
          target="_blank"
          rel="noopener noreferrer"
          title="Accéder au site du Comité Sport Boules de l'Allier"
        >
          <img
            src="/images/logo-cbda-mini.jpg"
            alt="Site du Comité Sport Boules de l'Allier"
            className={styles.logo}
          />
        </a>
        <h1 className={styles.title}>Calendrier CBDA pour la saison 2026-2027</h1>
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
