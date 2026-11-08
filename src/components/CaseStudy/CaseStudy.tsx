"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { StatusIndicator } from "@/components/atlas";
import { FadeInBlock, FadeInText } from "@/components/FadeIn";
import { ImageLightbox } from "@/components/ImageLightbox";
import {
  caseStudySections,
  isCaseStudyImage,
  isCaseStudyImageRow,
  type CaseStudyImage,
  type Project,
} from "@/data/projects";
import styles from "./CaseStudy.module.css";

interface CaseStudyProps {
  project: Project;
}

/** Opens an image in the lightbox; provided by CaseStudy to its figures. */
const OpenImage = createContext<(image: CaseStudyImage) => void>(() => {});

export function CaseStudy({ project }: CaseStudyProps) {
  const { caseStudy } = project;
  const [lightbox, setLightbox] = useState<CaseStudyImage | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  if (!caseStudy) {
    return null;
  }

  return (
    <OpenImage.Provider value={setLightbox}>
      <article className={styles.page}>
        <header className={styles.header}>
          {/* Figma frame 357:390 — meta and title left, status right. */}
          <div className={styles.headerText}>
            <div className={styles.meta}>
              <FadeInText>
                {[project.company, project.role].filter(Boolean).join(" / ")}
              </FadeInText>
            </div>
            <div className={styles.title} role="heading" aria-level={1}>
              <FadeInText>{project.title}</FadeInText>
            </div>
          </div>
          <StatusIndicator status={project.status} />
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

        {/* Figma node 376:2461 — headline numbers in a bordered strip. */}
        {project.metrics?.length ? (
          <FadeInBlock className={styles.metricsFade} delay="0.2s">
            <dl className={styles.metrics}>
              {project.metrics.map((metric) => (
                <div key={metric.label} className={styles.metric}>
                  <dt className={styles.metricLabel}>{metric.label}</dt>
                  <dd className={styles.metricValue}>{metric.value}</dd>
                </div>
              ))}
            </dl>
          </FadeInBlock>
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
                    isCaseStudyImageRow(block) ? (
                      // Portrait photos side by side, so neither runs huge.
                      <div key={block.row[0].src} className={styles.figureRow}>
                        {block.row.map((image) => (
                          <CaseFigure key={image.src} image={image} />
                        ))}
                      </div>
                    ) : isCaseStudyImage(block) ? (
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
      {lightbox ? (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={closeLightbox}
        />
      ) : null}
    </OpenImage.Provider>
  );
}

function CaseFigure({
  image,
  className,
}: {
  image: CaseStudyImage;
  className?: string;
}) {
  const open = useContext(OpenImage);
  return (
    <figure className={className ?? styles.sectionFigure}>
      <FadeInBlock>
        <button
          type="button"
          className={styles.figureButton}
          aria-label={`Enlarge image: ${image.alt}`}
          onClick={() => open(image)}
        >
          <img src={image.src} alt={image.alt} className={styles.figureImage} />
        </button>
      </FadeInBlock>
    </figure>
  );
}
