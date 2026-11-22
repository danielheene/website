// Imported by the templates, so it stays free of server modules (Storybook bundles it for the
// browser); `getEmailSite` builds a real `EmailSite` on the server.
export type EmailLink = {
  label: string
  href: string
}

export type EmailSocialLink = EmailLink & {
  /** An Iconify name (`prefix:name`) or a house alias, rendered to PNG by `/api/icons/png`. */
  icon: string
}

/** What every email's layout shows besides its own content: logo link, footer, assets. */
export type EmailSite = {
  name: string
  url: string
  /** Base of the font, logo and image URLs; inboxes only load assets by absolute URL. */
  assetUrl: string
  /** Base of the Next app's routes, for the icon PNGs (`/api/icons/png`). */
  appUrl: string
  /** The postal address as lines: name, street, place, country. */
  address: string[]
  socialLinks: EmailSocialLink[]
  legalLinks: EmailLink[]
}

export const emailAssetUrl = (site: EmailSite, path: string) => `${site.assetUrl}${path}`

/** An icon rendered to PNG by the app's `/api/icons/png` route, in one hex colour (`RRGGBB`). */
export const emailIconUrl = (site: EmailSite, icon: string, color: string) =>
  `${site.appUrl}/api/icons/png?icon=${encodeURIComponent(icon)}&color=${color}`

/**
 * Sample site for the templates' `PreviewProps`. Assets load from `/static`, where both previews
 * serve `public/` (`dev:email` and Storybook's `staticDirs`). Icons come from the running Next app,
 * as neither preview serves its routes.
 */
export const PREVIEW_SITE: EmailSite = {
  name: 'heene.io',
  url: 'https://heene.io',
  assetUrl: '/static',
  appUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  address: ['Daniel Heene', 'Musterstraße 1', '12345 Musterstadt', 'Germany'],
  socialLinks: [
    {
      icon: 'mail',
      label: 'Email',
      href: 'mailto:hello@example.com',
    },
    {
      icon: 'phone',
      label: 'Phone Number',
      href: 'tel:+490000000000',
    },
    {
      icon: 'simple-icons:github',
      label: 'GitHub',
      href: 'https://github.com/',
    },
    {
      icon: 'simple-icons:linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/',
    },
  ],
  legalLinks: [
    {
      label: 'Legal Notice',
      href: 'https://heene.io/legal-notice',
    },
    {
      label: 'Privacy Policy',
      href: 'https://heene.io/privacy-policy',
    },
  ],
}
