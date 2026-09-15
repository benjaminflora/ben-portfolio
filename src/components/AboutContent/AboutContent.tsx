"use client";

import { FadeInText } from "@/components/FadeIn";
import styles from "@/app/about/about.module.css";

export function AboutContent() {
  return (
    <main className={styles.about}>
      <div className={styles.copy}>
        <div className={styles.heading} role="heading" aria-level={1}>
          <FadeInText>About</FadeInText>
        </div>
        <div className={styles.body}>
          <div className={styles.paragraph}>
            <FadeInText lines>
              I’m Ben, a product-oriented design systems designer. I build systems around the need—to enhance product UX and support the engineers developing it.
            </FadeInText>
          </div>
          <div className={styles.paragraph}>
            <FadeInText lines>
              Currently I design software for mission-critical operations at Sift, where the work has to stay clear under pressure and hold up as the product and the people using it grow.
            </FadeInText>
          </div>
          <div className={styles.paragraph}>
            <FadeInText lines>
              Before that I spent time on brand, product, and systems work that sits between design and engineering: tokens, components, and the documentation that makes them usable.
            </FadeInText>
          </div>
        </div>
      </div>
    </main>
  );
}
