export interface Sketch {
  id: string;
  /** Traced line work only — transparent background. */
  src: string;
  alt: string;
}

export const sketches: Sketch[] = [
  {
    id: "sketchbook",
    src: "/art/doodles/sketchbook.svg",
    alt: "Ink doodles including a ghost, guitar, skull, and jellyfish",
  },
  {
    id: "ink-studies",
    src: "/art/doodles/ink-studies.svg",
    alt: "Ink character sketches including a squid, a figure in a cap, and a scribbled NAH mark",
  },
  {
    id: "sun-studies",
    src: "/art/doodles/sun-studies.svg",
    alt: "Pencil studies of a smiling sun, skulls, a bonsai, and other creatures",
  },
  {
    id: "lucky",
    src: "/art/doodles/lucky.svg",
    alt: "Dense pencil illustration of faces, a grim reaper, and the word lucky",
  },
];
