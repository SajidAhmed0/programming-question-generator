import React from "react";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <p>© {new Date().getFullYear()} Quiz Generator. All Rights Reserved.</p>
    </footer>
  );
}

export default Footer;
