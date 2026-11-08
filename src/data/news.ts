/*
 * Press coverage, listed under Press on the About page.
 */
import type { IndexListItem } from "@/components/atlas";


export interface NewsItem {
  id: string;
  outlet: string;
  date: string;
  headline: string;
  /** Short title for lists; falls back to the headline. */
  title?: string;
  byline?: string;
  excerpt?: string;
  imageSrc?: string;
  /** Link to the original article; opens in a new tab. */
  href?: string;
}

export const newsItems: NewsItem[] = [
  {
    id: "pasadena-weekly-fires-help",
    outlet: "Pasadena Weekly",
    title: "Fires.help, a one-stop shop for LA fire relief",
    date: "Jan 23, 2025",
    headline:
      "Mutual Aid Aggregation: Fires help one-stop shop for resources and aid across Los Angeles County",
    byline: "By Samantha Stahl",
    excerpt:
      "Fires.help brought volunteer listings, donations, containment updates and recovery resources into one map. I designed the UI/UX alongside founder Zane St. John and engineer Jet Jadeja.",
    href: "https://www.pasadenaweekly.com/news/mutual-aid-aggregation-fires-help-one-stop-shop-for-resources-and-aid-across-los-angeles/article_3418db8e-d91a-11ef-bec5-13f6da3b6951.html",
  },
];

/** Rows for the About page's Press index: outlet and year on the right. */
export const press: IndexListItem[] = newsItems.map((item) => ({
  id: item.id,
  title: item.title ?? item.headline,
  source: `${item.outlet} · ${item.date.slice(-4)}`,
  href: item.href,
  external: true,
}));

