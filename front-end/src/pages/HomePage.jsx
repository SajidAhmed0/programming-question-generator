import React from "react";
import styles from "./HomePage.module.css";

const HomePage = () => {
  return (
    <div className={styles.container}>
      {/* Header */}
      {/* <header className={styles.header}>
        <h1>Programming Question Generator</h1>
        <nav>
          <ul className={styles.navLinks}>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/generate">Generate</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      </header> */}

      {/* Hero Section */}
      <section className={styles.hero}>
        <h2>Generate High-Quality Programming Questions</h2>
        <p>Create custom questions for coding assessments and learning.</p>
        <a href="/generate" className={styles.ctaButton}>Generate</a>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <h3>AI-Powered</h3>
          <p>Generate unique coding questions using advanced AI models.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Customizable</h3>
          <p>Choose language, difficulty, and type to suit your needs.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Efficient</h3>
          <p>Save time with instant and high-quality question generation.</p>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className={styles.footer}>
        <p>&copy; 2025 Programming Question Generator. All rights reserved.</p>
        <div className={styles.socialLinks}>
          <a href="#">Twitter</a>
          <a href="#">GitHub</a>
          <a href="#">LinkedIn</a>
        </div>
      </footer> */}
    </div>
  );
};

export default HomePage;
