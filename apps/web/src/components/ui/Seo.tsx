import { Helmet } from "react-helmet-async";

interface Props {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://maidhire.com").replace(/\/$/, "");

export function Seo({ title, description, path = "", noIndex }: Props) {
  const full = title.includes("MaidHire") ? title : `${title} — MaidHire`;
  return (
    <Helmet>
      <title>{full}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={`${SITE_URL}${path}`} />
      <meta property="og:title" content={full} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}${path}`} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  );
}
