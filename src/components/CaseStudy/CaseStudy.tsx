"use client";

import { FadeInBlock, FadeInText } from "@/components/FadeIn";
import {
  caseStudySections,
  isCaseStudyImage,
  type CaseStudyImage,
  type Project,
} from "@/data/projects";
import styles from "./CaseStudy.module.css";

interface CaseStudyProps {
  project: Project;
}

export function CaseStudy({ project }: CaseStudyProps) {
  const { caseStudy } = project;

  if (!caseStudy) {
    return null;
  }

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <div className={styles.meta}>
          <FadeInText>
            {[project.company, project.role].filter(Boolean).join(" / ")}
          </FadeInText>
        </div>
        <div className={styles.title} role="heading" aria-level={1}>
          <FadeInText>{project.title}</FadeInText>
        </div>
      </header>
      {project.imageSrc ? (
        <CaseFigure
          image={{
            src: project.imageSrc,
            alt: project.imageAlt || project.title,
          }}
          className={styles.hero}
        />
      ) : null}

      <div className={styles.sections}>
        {caseStudySections.map((section) => {
          const blocks = caseStudy[section.key];
          if (!blocks?.length) {
            return null;
          }

          return (
            <section
              key={section.key}
              className={styles.section}
              aria-labelledby={`case-${section.key}`}
            >
              <div
                id={`case-${section.key}`}
                className={styles.sectionLabel}
                role="heading"
                aria-level={2}
              >
                <FadeInText>{section.label}</FadeInText>
              </div>
              <div className={styles.sectionBody}>
                {blocks.map((block) =>
                  isCaseStudyImage(block) ? (
                    <CaseFigure key={block.src} image={block} />
                  ) : (
                    <div key={block} className={styles.paragraph}>
                      <FadeInText lines>{block}</FadeInText>
                    </div>
                  ),
                )}
              </div>
            </section>
          );
        })}
        {project.caseStudyImages?.map((image) => (
          <CaseFigure
            key={image.src}
            image={image}
            className={styles.figure}
          />
        ))}
      </div>
    </article>
  );
}

function CaseFigure({
  image,
  className,
}: {
  image: CaseStudyImage;
  className?: string;
}) {
  return (
    <figure className={className ?? styles.sectionFigure}>
      <FadeInBlock>
        <img src={image.src} alt={image.alt} className={styles.figureImage} />
      </FadeInBlock>
    </figure>
  );
}
