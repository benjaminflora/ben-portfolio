"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ProjectCard, TabGroup, type TabItem } from "@/components/atlas";
import { AtlasLock, AtlasShowcase } from "@/components/AtlasShowcase";
import { FadeInBlock } from "@/components/FadeIn";
import { ImageLightbox } from "@/components/ImageLightbox";
import {
  getScrollPosition,
  restoreScrollPosition,
} from "@/components/SmoothScroll";
import {
  projectCategories,
  projectsByCategory,
  type Project,
  type ProjectCategory,
} from "@/data/projects";
import styles from "./ProjectSection.module.css";

const visibleCategories = projectCategories.filter(
  (category) => !category.disabled,
);

export function ProjectSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(
    null,
  );
  const pendingScroll = useRef<number | null>(null);
  const activeCategory: ProjectCategory = projectCategories[activeTab].key;
  const closeLightbox = useCallback(() => setLightbox(null), []);

  useLayoutEffect(() => {
    if (pendingScroll.current == null) {
      return;
    }

    restoreScrollPosition(pendingScroll.current);
    pendingScroll.current = null;
  }, [activeTab]);

  const tabs: TabItem[] = projectCategories.map((category, index) => ({
    label: category.label,
    state: category.disabled
      ? "disabled"
      : index === activeTab
        ? "active"
        : "enabled",
  }));

  return (
    <section className={styles.section}>
      <FadeInBlock className={styles.navFade} delay="1.35s">
        <div className={styles.projectNav}>
          <TabGroup
            tabs={tabs}
            onTabChange={(index) => {
              if (projectCategories[index].disabled || index === activeTab) {
                return;
              }

              pendingScroll.current = getScrollPosition();
              setActiveTab(index);
            }}
          />
        </div>
      </FadeInBlock>
      <div className={styles.stack}>
        {visibleCategories.map((category) => {
          const isActive = category.key === activeCategory;

          return (
            <div
              key={category.key}
              className={styles.grid}
              data-active={isActive ? "true" : "false"}
              role="tabpanel"
              aria-label={`${category.label} projects`}
              aria-hidden={isActive ? undefined : true}
              inert={isActive ? undefined : true}
            >
              {category.key === "atlas" ? (
                <AtlasLock>
                  <AtlasShowcase />
                </AtlasLock>
              ) : null}
              {projectsByCategory[category.key].map((project, index) => (
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
          );
        })}
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
      delay={`${1.5 + index * 0.08}s`}
    >
      <ProjectCard
        title={project.title}
        company={project.company}
        role={project.role}
        href={
          project.visual || project.disabled || !project.caseStudy
            ? undefined
            : `/projects/${project.slug}`
        }
        imageSrc={project.imageSrc}
        imageAlt={project.imageAlt}
        disabled={project.disabled}
        showMeta={!project.visual}
        onSelect={onSelectVisual}
      />
    </FadeInBlock>
  );
}
