"use client";

import { IndexList } from "@/components/atlas";
import { FadeInBlock, FadeInText } from "@/components/FadeIn";
import { press } from "@/data/news";
import { writing } from "@/data/writing";
// Same page, header and section styles as the case studies, so About reads
// as one more page of the site.
import styles from "@/components/CaseStudy/CaseStudy.module.css";

const BIO = [
  "Hey, I’m Ben! I grew up in Sonoma County, and I now live in LA.",
  "I like to spend my free time cooking, watching horror movies, and drawing in my sketchbook–my passion for art has been the foundation for my career as a product designer, so my work will most often start with a pencil and paper.",
  "I enjoy products that approach technical challenges with thoughtful and delightful design. As the Director of Design @usclavalab, I teach other designers how to approach difficult design challenges in an entrepreneurial environment from an atomic design and systems thinking approach.",
];

export function AboutContent() {
  return (
    <article className={styles.page}>
      <header className={styles.header}>
        {/* Square photo above the name, flush left with the bio. */}
        <div className={styles.identity}>
          {/* Same load-in as the rest of the page, just ahead of the name. */}
          <FadeInBlock className={styles.portraitFade} delay="0s">
            <img
              src="/brand/ben-photo.jpg"
              alt="Benjamin Flora standing on a boulder among pine trees"
              className={styles.portrait}
              width={720}
              height={720}
            />
          </FadeInBlock>
          <div className={styles.headerText}>
            <div className={styles.meta}>
              <FadeInText>Sift Stack / Design Systems</FadeInText>
            </div>
            <div className={styles.title} role="heading" aria-level={1}>
              <FadeInText>Benjamin Flora</FadeInText>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.sections}>
        <section
          className={`${styles.section} ${styles.sectionIntro}`}
          aria-label="About me"
        >
          <div className={styles.sectionBody}>
            {BIO.map((paragraph) => (
              <div
                key={paragraph}
                className={`${styles.paragraph} ${styles.paragraphIntro}`}
              >
                <FadeInText lines>{paragraph}</FadeInText>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-writing">
          <div id="about-writing" className={styles.sectionLabel} role="heading" aria-level={2}>
            <FadeInText>Writing</FadeInText>
          </div>
          <FadeInBlock className={styles.sectionFigure} delay="0.3s">
            <IndexList items={writing} />
          </FadeInBlock>
        </section>

        <section className={styles.section} aria-labelledby="about-press">
          <div id="about-press" className={styles.sectionLabel} role="heading" aria-level={2}>
            <FadeInText>Press</FadeInText>
          </div>
          <FadeInBlock className={styles.sectionFigure} delay="0.4s">
            <IndexList items={press} />
          </FadeInBlock>
        </section>
      </div>
    </article>
  );
}
