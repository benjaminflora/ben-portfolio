export interface Sketch {
  id: string;
  /** Traced line work only — transparent background. A 1800px-tall WebP
   * rendered from the matching .svg (kept alongside as the source): the
   * traced vectors were too heavy to draw inside the 3D book. */
  src: string;
  alt: string;
}

export const sketches: Sketch[] = [
  {
    id: "sketchbook",
    src: "/art/doodles/sketchbook.webp",
    alt: "Ink doodles including a ghost, guitar, skull, and jellyfish",
  },
  {
    id: "ink-studies",
    src: "/art/doodles/ink-studies.webp",
    alt: "Ink character sketches including a squid, a figure in a cap, and a scribbled NAH mark",
  },
  {
    id: "sun-studies",
    src: "/art/doodles/sun-studies.webp",
    alt: "Pencil studies of a smiling sun, skulls, a bonsai, and other creatures",
  },
  {
    id: "lucky",
    src: "/art/doodles/lucky.webp",
    alt: "Dense pencil illustration of faces, a grim reaper, and the word lucky",
  },
];
