"use client";

import { useCallback, useState } from "react";
import { IndexList, ProjectCard } from "@/components/atlas";
import { AtlasLock, AtlasShowcase } from "@/components/AtlasShowcase";
import { FadeInBlock } from "@/components/FadeIn";
import { ImageLightbox } from "@/components/ImageLightbox";
import {
  projectCategories,
  projectsByCategory,
  type Project,
  type ProjectCategory,
} from "@/data/projects";
import { writing } from "@/data/writing";
import styles from "./ProjectSection.module.css";

/** One category's grid — the home page's default and each tab's own page. */
export function ProjectSection({ category = "design" }: { category?: ProjectCategory }) {
  const label = projectCategories.find((c) => c.key === category)?.label ?? category;
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(
    null,
  );
  const closeLightbox = useCallback(() => setLightbox(null), []);

  return (
    <section className={styles.section} data-project-section>
      <div className={styles.grid} aria-label={`${label} projects`}>
        {category === "writing" ? (
          <FadeInBlock className={styles.fullRow} delay="0.9s">
            <IndexList items={writing} />
          </FadeInBlock>
        ) : null}
        {category === "atlas" ? (
          <AtlasLock>
            <AtlasShowcase />
          </AtlasLock>
        ) : null}
        {projectsByCategory[category].map((project, index) => (
          <ProjectCardFade
            key={project.id}
            project={project}
            index={index}
            onSelectVisual={
              project.visual && project.imageSrc
                ? () => {
                    const src = project.imageSrc;
                    if (!src) {
                      return;
                    }

                    setLightbox({
                      src,
                      alt: project.imageAlt || project.title,
                    });
                  }
                : undefined
            }
          />
        ))}
      </div>
      {lightbox ? (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={closeLightbox}
        />
      ) : null}
    </section>
  );
}

function ProjectCardFade({
  project,
  index,
  onSelectVisual,
}: {
  project: Project;
  index: number;
  onSelectVisual?: () => void;
}) {
  return (
    <FadeInBlock
      className={styles.cardFade}
      delay={`${0.9 + index * 0.05}s`}
    >
      <ProjectCard
        title={project.card?.title ?? project.title}
        description={project.card?.description}
        meta={project.card?.meta}
        role={project.role}
        href={
          project.externalHref ??
          (project.visual || project.disabled || !project.caseStudy
            ? undefined
            : `/projects/${project.slug}`)
        }
        external={Boolean(project.externalHref)}
        imageSrc={project.card?.imageSrc ?? project.imageSrc}
        imageAlt={project.imageAlt}
        disabled={project.disabled}
        showMeta={!project.visual}
        onSelect={onSelectVisual}
      />
    </FadeInBlock>
  );
}
