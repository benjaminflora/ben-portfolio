"use client";

import { FadeInText } from "@/components/FadeIn";
import type { WritingPiece } from "@/data/writing";
// Same page, header and section styles as the case studies.
import styles from "@/components/CaseStudy/CaseStudy.module.css";

export function WritingArticle({ piece }: { piece: WritingPiece }) {
  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <div className={styles.meta}>
            <FadeInText>{piece.meta}</FadeInText>
          </div>
          <div className={styles.title} role="heading" aria-level={1}>
            <FadeInText>{piece.title}</FadeInText>
          </div>
        </div>
      </header>

      <div className={styles.sections}>
        {piece.sections.map((section, index) => (
          <section
            key={section.label}
            className={styles.section}
            aria-labelledby={`writing-${index}`}
          >
            <div
              id={`writing-${index}`}
              className={styles.sectionLabel}
              role="heading"
              aria-level={2}
            >
              <FadeInText>{section.label}</FadeInText>
            </div>
            <div className={styles.sectionBody}>
              {section.paragraphs.map((paragraph) => (
                <div key={paragraph} className={styles.paragraph}>
                  <FadeInText lines>{paragraph}</FadeInText>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
