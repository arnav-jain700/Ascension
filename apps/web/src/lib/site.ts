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
export const SITE_MAP_EMBED_URL = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d436575.7746018886!2d75.09512658906252!3d31.255392100000012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a5f5e9c489cf3%3A0x4049a5409d53c300!2sLovely%20Professional%20University!5e0!3m2!1sen!2sin!4v1775756902840!5m2!1sen!2sin";

/** Shown on Contact when no embed is configured */
export const SITE_BUSINESS_ADDRESS =
  process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ??
  "Lovely Professional University, Jalandhar - Delhi G.T. Road, Phagwara, Punjab 144411, India";

export const SITE_CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "home.ascensionapparel@gmail.com";
