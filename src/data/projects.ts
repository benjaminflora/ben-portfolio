export type ProjectCategory = "design" | "art" | "writing" | "atlas";

export const caseStudySections = [
  { key: "summary", label: "Summary" },
  { key: "problem", label: "Problem" },
  { key: "process", label: "Process" },
  { key: "solution", label: "Solution" },
  { key: "result", label: "Result" },
  { key: "takeaways", label: "Takeaways" },
] as const;

export type CaseStudySectionKey = (typeof caseStudySections)[number]["key"];

export type CaseStudyImage = {
  src: string;
  alt: string;
};

export type CaseStudyBlock = string | CaseStudyImage;

export type CaseStudyContent = Partial<
  Record<CaseStudySectionKey, CaseStudyBlock[]>
>;

export interface Project {
  id: string;
  slug: string;
  title: string;
  company?: string;
  role?: string;
  imageSrc?: string;
  imageAlt?: string;
  disabled?: boolean;
  visual?: boolean;
  caseStudy?: CaseStudyContent;
  caseStudyImages?: CaseStudyImage[];
}

export function isCaseStudyImage(
  block: CaseStudyBlock,
): block is CaseStudyImage {
  return typeof block !== "string";
}

export function getCaseStudyDescription(content: CaseStudyContent) {
  const first = content.summary?.find((block) => typeof block === "string");
  return first ?? "";
}

export const projectCategories: {
  key: ProjectCategory;
  label: string;
  disabled?: boolean;
}[] = [
  { key: "design", label: "Design" },
  { key: "art", label: "Art" },
  { key: "writing", label: "Writing", disabled: true },
  { key: "atlas", label: "Atlas", disabled: true },
];

const sample = (
  summary: string,
  problem: string,
  process: string,
  solution: string,
  result: string,
): CaseStudyContent => ({
  summary: [summary],
  problem: [problem],
  process: [process],
  solution: [solution],
  result: [result],
});

export const projectsByCategory: Record<ProjectCategory, Project[]> = {
  design: [
    {
      id: "design-1",
      slug: "nebula-design-system",
      title: "Nebula Design System",
      company: "Sift",
      role: "Design Systems Intern",
      imageSrc: "/projects/nebula.jpg",
      imageAlt: "Nebula in light mode on a workstation monitor and a side panel of telemetry channels",
      disabled: true,
      caseStudy: sample(
        "Nebula is Sift’s design system—tokens, components, and documentation for product surfaces that have to stay clear under operational pressure.",
        "Product UI was accumulating one-off patterns. The same control shipped with different spacing, type, and states depending on which screen it lived on.",
        "I audited usage across the product, named the primitives teams actually needed, and documented states against a shared token set.",
        "A system with a small kit of components, intent-based tokens, and usage notes so design and engineering ship from the same spec.",
        "New work starts from Nebula instead of a blank file. Drift is caught in review instead of in production.",
      ),
    },
    {
      id: "design-2",
      slug: "toph",
      title: "Toph",
      company: "Lavalab",
      role: "Founding Designer",
      imageSrc: "/projects/toph.png",
      imageAlt: "Toph dashboard on a laptop, showing activity logs, a recording, and a field map",
      caseStudy: {
        summary: [
          "Toph is an AI-native agricultural compliance product that translates audio recordings from an iOS app into audit-ready reports across low-bandwidth farms.",
        ],
        problem: [
          "Every year, farmers in California face roughly 5–10 government audits across water, pesticide, and fertilizer usage. When these audits occur, farmers are expected to have accurate and up-to-date documentation for everything that occurs on their farm, costing farmers thousands of work hours yearly just to ensure compliance. Beyond that, farm managers have to keep track of the task logs taken by each of the farm-hands daily, to ensure that no record goes missing.",
        ],
        process: [
          "To solve this problem, my team had to create a tech product that was uniquely fitting to farm conditions.",
          "Our ICPs use gloves, making tap actions on iOS devices difficult. Most farm-hands do not speak English, meaning any voice-based action must support multiple languages, as well as heavy local accents. Farms are in large open areas, and in most cases do not have constant access to Wi-Fi.",
          "To understand these issues more deeply, we interviewed farmers across 30,000 acres of farmland, and tested our products with almond farms in Patterson, as well as grape vineyards in Lodi to ensure that our product could support specialty crop farms all with different processes.",
        ],
        solution: [
          {
            src: "/projects/toph-activity-logs.jpg",
            alt: "Toph Activity Logs with a voice recording, transcript summary, and GPS map preview",
          },
          "At its core, our product was more than just a compliance software—it was uniquely designed to also help farm managers manage their crops and employees.",
          "By tagging voice memos with GPS, we allowed farmers to see what was happening on their farm, and where. If a PCA (Pest Control Advisor) were to record sightings of spider mites on crops in the north field, a farmer could use our software to track its spread across sighting locations.",
          "I designed the software to support potential scaling into that problem space. Toph came equipped with two interfaces: an iOS app, and a website. The iOS app came equipped with a recorder, as well as a locally run AI model to support a confirmation step while parsing memo information. Once the recording details were confirmed, the information was sent to the farm manager on the website.",
          "On this website, farmers had a database of recordings filterable by employee name, date, and activity type—each recording showing a GPS preview. If our managers wished to see the collective GPS recordings, they could expand the map to track their employee tasks throughout the day at scale.",
          "In reports, farm managers would be able to customize compliant farm report templates in the app. Once a template was set, they would select recordings from their employees, and the parsed activity details would populate the sheet recording fertilizer, water, and pesticide usage levels per acre.",
          {
            src: "/projects/toph-map.jpg",
            alt: "Toph Map view of Bays Ranch, with a satellite farm overlay and an Employee Logs panel",
          },
        ],
        result: [
          "After testing our product across 30,000 acres of farmland, the feedback was overwhelmingly positive. In May, our product also received positive remarks from Jamie Siminoff, the founder of Ring, in USC Lavalab’s “Demo Day.”",
        ],
      },
      caseStudyImages: [
        {
          src: "/projects/toph-demo-day.jpg",
          alt: "The Toph team on stage at USC Lavalab Demo Day, with the Toph logo on screen behind them",
        },
      ],
    },
    {
      id: "design-3",
      slug: "bulk-actions",
      title: "Bulk Actions",
      company: "July",
      role: "Product Design Intern",
      imageSrc: "/projects/bulk-actions.png",
      imageAlt:
        "July Deals on an iMac, with five deals selected and a bulk actions menu open",
      caseStudy: {
        summary: [
          "July is a software product that helps talent agencies manage creators and brand deals. I spent 7 months working with them as a design intern to help bring extra UI and UX polish to their platform. While working there, I designed a growth campaign that booked calls with 2 large enterprise leads (20% increase in revenue), a cross-cutting bulk actions feature, and a few pages of the platform. This case study will dive into bulk actions.",
        ],
        problem: [
          "The founder of one of July’s customers reached out and described a unique issue he was facing. His company updated deal invoices bi-monthly, meaning when it was time, he would spend hours selecting deals one by one and updating invoice statuses, amounts, and dates. July’s product is largely a database—any action done in bulk would take painstaking effort by our users, which was more frequent than we initially believed.",
        ],
        process: [
          "To understand the problem, I booked calls with dozens of managers in July’s client base—each of them walked me through their day to day flows while I recorded them. I synthesized commonly used actions in a Figma file across different app surfaces.",
          {
            src: "/projects/bulk-actions-surfaces.jpg",
            alt: "Audit of July app surfaces with screenshots and bulk-action notes for Reports, Media Kits, Decks, Talent, Brands CRM, Deals, and Calendar",
          },
          "I then moved on to create the bulk actions modal. For simplicity, I designed these flows with progressive disclosure—each bulk actions modal showed only content-specific actions, and were only revealed once the user decided complex actions were needed (beyond otherwise accessible actions like delete or archive).",
          {
            src: "/projects/bulk-actions-menu.jpg",
            alt: "Six bulk-action menu variants for folder actions, with keyboard shortcuts and a selected-file toolbar",
          },
          "After presenting my work to the team, I identified issues with accessibility, frame structure, and color usage. I then presented my finalized version to the team, and got the go ahead to start building flows.",
          {
            src: "/projects/bulk-actions-modal.jpg",
            alt: "Final bulk actions modal listing change status, switch talent, and other deal actions for five selected deals",
          },
        ],
        solution: [
          "The solution was built across 7 frequently-occurring actions: Change status, Switch talent, Switch talent (advanced), Unassign from user, Send message to talent, Download deals as CSV, and Edit invoice details.",
          "I presented this work to the lead engineer of the company with fully functional prototypes in Figma.",
        ],
      },
      caseStudyImages: [
        {
          src: "/projects/bulk-actions-figma.jpg",
          alt: "Figma canvas of final bulk-action flows, grouped by action across many prototype frames",
        },
      ],
    },
    {
      id: "design-4",
      slug: "billboards",
      title: "Billboards",
      company: "AfterQuery",
      role: "Design Contractor",
      imageSrc: "/projects/billboards.png",
      imageAlt:
        "AfterQuery outdoor billboard with a magnifying glass and the line Human expertise, encoded into data that models can learn",
      caseStudy: {
        summary: [
          "The client requested three different billboard designs at varying scales and ready-to-ship Illustrator files prepared for a local printing agency. The timeline of this project was around 2 weeks.",
        ],
        problem: [
          "At the time, AfterQuery lacked an established brand identity or design system. Working without formal guidelines, I relied on design intuition and a close reading of the company’s existing visual language to inform my direction.",
          "Knowing a rebrand was upcoming, I made a deliberate choice to anchor the work in a light, neutral palette, which I thought to be flexible enough to remain relevant through an identity transition without requiring a full redesign. I drew from a subtle black and white duotone pattern I had seen in their existing website and marketing materials, and carried it through the billboard compositions to create visual cohesion with their existing assets.",
        ],
        process: [
          "As with most of my projects, ideas started on paper to roughly figure out an ideal composition. I had never worked on a large-scale graphic project such as a billboard before, so I put extra care and thought into accessibility.",
          "Afterwards, I moved my ideas into Figma, creating visual motifs within Adobe Illustrator and Photoshop and entering them into a canvas. I’ve heard others describe data companies as the opposite of creativity—I understand that many designers are fearful of AI, however I personally am excited by all the new possibilities that AI creates for designers, which is why I went for a playful look in these billboards.",
          "An interesting challenge when it comes to data companies is brand balance. Data companies essentially have two customers: data experts, who are relied upon to bring in training data and are often hired on a contractual basis, and the AI labs, who are tech-forward and look for enterprise trust in a brand. To support these needs, I went for a motif that was both playful and academic. Paper planes and magnifying glasses seemed to be a nice balance between those two identities.",
        ],
        takeaways: [
          "This was my first project with AfterQuery, and it laid the groundwork for what would eventually become a broader brand guide. Frequent communication and iteration with the client made it easier to understand their design sensibilities and desired direction over time.",
          "The project was also my introduction to professional contract work. As my first high-profile design challenge, it taught me a great deal — particularly around graphic design handoffs with external agencies, and the importance of designing with future brand changes in mind.",
        ],
      },
      caseStudyImages: [
        {
          src: "/projects/billboards-experts-day.jpg",
          alt: "AfterQuery Experts in Everything billboard with paper planes, photographed in daylight with two people standing in front",
        },
      ],
    },
  ],
  art: [
    {
      id: "art-1",
      slug: "sketchbook",
      title: "Sketchbook",
      imageSrc: "/projects/art/sketchbook.png",
      imageAlt:
        "Ink doodles in a lined sketchbook, including a ghost, guitar, skull, and jellyfish",
      visual: true,
    },
    {
      id: "art-2",
      slug: "house-study",
      title: "House Study",
      imageSrc: "/projects/art/house-study.png",
      imageAlt: "Pencil drawing of a cubic house in a wooded landscape",
      visual: true,
    },
    {
      id: "art-3",
      slug: "sun-studies",
      title: "Sun Studies",
      imageSrc: "/projects/art/sun-studies.png",
      imageAlt:
        "Pencil studies of a smiling sun, skulls, a bonsai, and other creatures",
      visual: true,
    },
    {
      id: "art-4",
      slug: "ink-studies",
      title: "Ink Studies",
      imageSrc: "/projects/art/ink-studies.png",
      imageAlt:
        "Ink character sketches including a squid, a figure in a cap, and a scribbled NAH mark",
      visual: true,
    },
    {
      id: "art-5",
      slug: "lucky",
      title: "Lucky",
      imageSrc: "/projects/art/lucky.png",
      imageAlt:
        "Dense pencil illustration of faces, a grim reaper, and the word lucky",
      visual: true,
    },
  ],
  writing: [],
  atlas: [],
};

export function getAllProjects(): Project[] {
  return Object.values(projectsByCategory).flat();
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getAllProjects().find((project) => project.slug === slug);
}

export function getCaseStudyProjects(): Project[] {
  return projectCategories.flatMap((category) => {
    if (category.disabled) {
      return [];
    }

    return projectsByCategory[category.key].filter(
      (project) => !project.disabled && project.caseStudy,
    );
  });
}
