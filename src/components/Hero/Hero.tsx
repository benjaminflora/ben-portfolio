"use client";

import { HeroTexture } from "./HeroTexture";
import { FadeInBlock, FadeInText } from "@/components/FadeIn";
import styles from "./Hero.module.css";

const HEADING_LINE_1 = "I'm Ben, a Product-Oriented";
const HEADING_LINE_2 = "Design Systems Designer.";
const SUBTITLE =
  "I build design systems around the need–to enhance product UX and support the engineers developing it. Currently designing software for mission critical software at Sift.";

export function Hero() {
  return (
    <section className={styles.hero}>
      <FadeInBlock className={styles.texture} delay="1.15s">
        <HeroTexture />
      </FadeInBlock>
      <div className={styles.content}>
        <div className={styles.copy} data-hero-copy>
          <div className={styles.heading} role="heading" aria-level={1}>
            <div className={styles.headingLine}>
              <FadeInText>{HEADING_LINE_1}</FadeInText>
            </div>
            <div className={styles.headingLine}>
              <FadeInText>{HEADING_LINE_2}</FadeInText>
            </div>
          </div>
          <div className={styles.subtitle}>
            <FadeInText lines>{SUBTITLE}</FadeInText>
          </div>
        </div>
      </div>
    </section>
  );
}
