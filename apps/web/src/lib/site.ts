/** External Ascension properties */
export const SITE_BLOG_URL = "https://ascensionapparel.blogspot.com/";

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/shop._ascension",
  facebook:
    "https://www.facebook.com/share/1CcZb3hR8C/",
  youtube: "https://www.youtube.com/@Shop-ascension",
  linkedin: "https://www.linkedin.com/in/ascension2026/",
} as const;

/** Google Maps “Embed a map” iframe src — paste from Maps → Share → Embed */
export const SITE_MAP_EMBED_URL = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ?? "";

/** Shown on Contact when no embed is configured */
export const SITE_BUSINESS_ADDRESS =
  process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ??
  "Phagwara, Punjab, India";

export const SITE_CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@ascension.example";
