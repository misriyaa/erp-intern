"use client";

import { useEffect, useState } from "react";
import styles from "./landing.module.css";
import { getLandingPage } from "@/services/landing.service";
import { useRouter } from "next/navigation";

export default function Home() {
  const [landing, setLanding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    async function loadLanding() {
      try {
        setLoading(true);
        setError("");

        const data = await getLandingPage();

        setLanding(data);
      } catch (error) {
        console.error("Landing page error:", error);
        setError("Unable to load the landing page.");
      } finally {
        setLoading(false);
      }
    }

    loadLanding();
  }, []);

  // ============================
  // LOADING
  // ============================

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingLogo}>
            ERP<span>Cloud</span>
          </div>

          <div className={styles.loader}></div>

          <p className={styles.loadingText}>
            Loading your business platform...
          </p>
        </div>
      </div>
    );
  }

  // ============================
  // ERROR
  // ============================

  if (error || !landing) {
    return (
      <div className={styles.errorScreen}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>!</div>

          <h2>Something went wrong</h2>

          <p>
            {error || "Landing page data could not be loaded."}
          </p>

          <button
            className={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================
  // IMAGE URL HELPER
  // ============================

  const getImageUrl = (image) => {
    if (!image) return "";

    return `${API_URL}/uploads/landingpageimage/${image}`;
  };

  // ============================
  // HERO BACKGROUND
  // ============================

  const heroBackground = landing.heroBackgroundImage
    ? `linear-gradient(
        rgba(255, 255, 255, 0.72),
        rgba(255, 255, 255, 0.72)
      ),
      url("${getImageUrl(landing.heroBackgroundImage)}")`
    : "linear-gradient(135deg, #f8fafc, #eff6ff)";

  return (
    <>
      {/* =========================
          NAVBAR
      ========================= */}

      <nav className={styles.navbar}>
        <div className={styles.logo}>
          {landing.logoText}
          <span>{landing.logoHighlight}</span>
        </div>

        <button
          className={styles.loginBtn}
          onClick={() => router.push("/auth/login")}
        >
          {landing.loginText}
        </button>

        {/* <button className={styles.loginBtn}>
          {landing.loginText}
        </button> */}
      </nav>

      {/* =========================
          HERO
      ========================= */}

      <section
        className={styles.hero}
        id="home"
        style={{
          backgroundImage: heroBackground,
        }}
      >
        <div className={styles.blurOne}></div>
        <div className={styles.blurTwo}></div>

        {/* LEFT CONTENT */}

        <div className={styles.heroContent}>
          <span className={styles.heroTag}>
            {landing.heroTag}
          </span>

          <h1 className={styles.heroTitle}>
            {landing.heroTitle}
          </h1>

          <p className={styles.heroDescription}>
            {landing.heroDescription}
          </p>

          <button className={styles.secondaryBtn}>
            {landing.heroButtonText}
          </button>
        </div>

        {/* RIGHT CONTENT */}

        <div className={styles.heroImageSection}>
          <div className={styles.dashboardCard}>

            {/* Dashboard Header */}

            <div className={styles.dashboardTop}>
              <div>
                <h3>
                  {landing.dashboardTitle}
                </h3>

                <span>
                  {landing.dashboardSubtitle}
                </span>
              </div>

              <div className={styles.status}></div>
            </div>

            {/* Dashboard Image */}

            <div className={styles.chartArea}>
              {landing.heroImage ? (
                <img
                  src={getImageUrl(landing.heroImage)}
                  alt="ERP Dashboard"
                  className={styles.dashboardImage}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  ERP Dashboard
                </div>
              )}
            </div>

            {/* Statistics */}

            <div className={styles.dashboardStats}>
              <div className={styles.statBox}>
                <h4>$84K</h4>
                <p>Revenue</p>
              </div>

              <div className={styles.statBox}>
                <h4>1,248</h4>
                <p>Orders</p>
              </div>

              <div className={styles.statBox}>
                <h4>98%</h4>
                <p>Inventory</p>
              </div>

              <div className={styles.statBox}>
                <h4>3,520</h4>
                <p>Customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          ABOUT
      ========================= */}

      <section
        className={styles.about}
        id="about"
      >
        {/* ABOUT IMAGES */}

        <div className={styles.aboutImages}>
          <div className={styles.imageGrid}>

            {landing.aboutImage1 ? (
              <img
                src={getImageUrl(landing.aboutImage1)}
                alt="ERP business management"
                loading="lazy"
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                About Image 1
              </div>
            )}

            {landing.aboutImage2 ? (
              <img
                src={getImageUrl(landing.aboutImage2)}
                alt="ERP inventory management"
                loading="lazy"
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                About Image 2
              </div>
            )}

            {landing.aboutImage3 ? (
              <img
                src={getImageUrl(landing.aboutImage3)}
                alt="ERP analytics"
                loading="lazy"
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                About Image 3
              </div>
            )}

            {landing.aboutImage4 ? (
              <img
                src={getImageUrl(landing.aboutImage4)}
                alt="ERP business dashboard"
                loading="lazy"
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                About Image 4
              </div>
            )}

          </div>
        </div>

        {/* ABOUT CONTENT */}

        <div className={styles.aboutContent}>
          <span className={styles.sectionTag}>
            {landing.aboutTag}
          </span>

          <h2>
            {landing.aboutTitle}
          </h2>

          <p>
            {landing.aboutDescription}
          </p>

          <div className={styles.features}>
            <div>✓ Inventory Management</div>
            <div>✓ Smart Billing</div>
            <div>✓ Business Analytics</div>
            <div>✓ Cloud Based System</div>
          </div>

          <p
            className={styles.learn}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Explore ERPCloud →
          </p>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className={styles.footer}>
        <p>
          {landing.footerText}
        </p>
      </footer>
    </>
  );
}