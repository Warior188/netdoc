import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Layout.module.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>NetDoc</span>
          <span className={styles.logoBadge}>MAKER</span>
        </Link>
        <nav className={styles.nav}>
          <span className={styles.navItem}>React + FastAPI + PostgreSQL</span>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}