import type { Metadata } from "next";
import { AboutContent } from "@/components/AboutContent";

export const metadata: Metadata = {
  title: "About — Benjamin Flora",
  description:
    "Product-oriented design systems designer building systems to enhance product UX.",
};

export default function AboutPage() {
  return <AboutContent />;
}
