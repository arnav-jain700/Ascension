import Link from "next/link";
import { SITE_BUSINESS_ADDRESS, SITE_CONTACT_EMAIL, SITE_MAP_EMBED_URL } from "@/lib/site";

const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_BUSINESS_ADDRESS)}`;

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl flex-1 px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-sm text-asc-charcoal">
        <Link href="/" className="font-medium text-asc-accent hover:underline">
          Home
        </Link>
        <span className="mx-2 text-asc-border-strong">/</span>
        Contact us
      </p>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-asc-matte sm:text-4xl">Contact us</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-asc-charcoal">
        Visit us, email the team, or find us on the map. Set{" "}
        <code className="rounded bg-asc-sand-muted px-1.5 py-0.5 text-xs">NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL</code>{" "}
        in <code className="rounded bg-asc-sand-muted px-1.5 py-0.5 text-xs">.env</code> with the iframe{" "}
        <span className="italic">src</span> from Google Maps → Share → Embed to show your exact pin.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-6 text-sm text-asc-charcoal">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-asc-matte">Address</h2>
            <p className="mt-2 leading-relaxed">{SITE_BUSINESS_ADDRESS}</p>
            <a
              href={mapsSearchUrl}
              className="mt-2 inline-block font-medium text-asc-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-asc-matte">Email</h2>
            <a href={`mailto:${SITE_CONTACT_EMAIL}`} className="mt-2 block text-asc-accent hover:underline">
              {SITE_CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-asc-border bg-asc-sand-muted shadow-sm">
          {SITE_MAP_EMBED_URL ? (
            <iframe
              title="Ascension business location"
              src={SITE_MAP_EMBED_URL}
              className="aspect-[4/3] h-[min(360px,50vh)] w-full sm:h-[320px] lg:aspect-auto lg:h-full lg:min-h-[280px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 p-8 text-center sm:aspect-auto sm:min-h-[280px]">
              <p className="max-w-xs text-sm text-asc-charcoal">
                Map embed not configured. Add your Google Maps embed URL to env, or open the location in
                Maps.
              </p>
              <a
                href={mapsSearchUrl}
                className="inline-flex h-11 items-center justify-center bg-asc-matte px-6 text-sm font-medium text-white transition-colors hover:bg-asc-charcoal"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Google Maps
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
