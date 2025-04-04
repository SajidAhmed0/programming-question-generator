import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}><img src="logo.png" alt="logo" /></div>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>Home</Link>
        <Link to="/generate" className={styles.navLink}>Generate</Link>
        <Link to="/questions" className={styles.navLink}>Question Bank</Link>
      </nav>
    </header>
  );
}

export default Header;
