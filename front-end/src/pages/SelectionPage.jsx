import React from "react";
import styles from "./SelectionPage.module.css";
import { FaCode, FaCogs, FaCalculator, FaBook } from "react-icons/fa";

const categories = [
  {
    name: "Software Engineering",
    description: "Explore the fundamentals of software design, security, and best practices in development.",
    path: "/category/software-engineering",
    icon: <FaCogs />,
  },
  {
    name: "Programming",
    description: "Sharpen your coding skills with algorithmic challenges and real-world problem-solving.",
    path: "/category/programming",
    icon: <FaCode />,
  },
  {
    name: "Maths",
    description: "Improve logical thinking with mathematical problems covering algebra, calculus, and more.",
    path: "/category/maths",
    icon: <FaCalculator />,
  },
  {
    name: "English",
    description: "Enhance your language skills with grammar, vocabulary, and comprehension exercises.",
    path: "/category/english",
    icon: <FaBook />,
  },
];

const SelectionPage = () => {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Welcome to the Knowledge Hub</h1>
          <p>Select a category to explore, learn, and challenge yourself!</p>
        </div>
      </section>

      {/* Category Grid */}
      <section className={styles.gridContainer}>
        {categories.map((category, index) => (
          <a key={index} href={category.path} className={styles.categoryCard}>
            <div className={styles.icon}>{category.icon}</div>
            <h2>{category.name}</h2>
            <p className={styles.description}>{category.description}</p>
          </a>
        ))}
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2025 Programming Question Generator | Empowering Learning</p>
      </footer>
    </div>
  );
};

export default SelectionPage;
