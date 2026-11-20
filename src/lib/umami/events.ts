/**
 * Every custom Umami event the site sends. Names are kebab-case; details go in
 * the event data. `resume-download-<locale>`, `resume-validate` and `toasty`
 * predate this list and keep their names so their history stays continuous.
 */
export const UmamiEvent = {
  ResumeValidate: 'resume-validate',
  Toasty: 'toasty',
  ThemeSwitch: 'theme-switch',
  ContactForm: 'contact-form',
  CodeCopy: 'code-copy',
  ChecksumCopy: 'checksum-copy',
  ContactLink: 'contact-link',
  OutboundLink: 'outbound-link',
  FeedLink: 'feed-link',
  FileDownload: 'file-download',
  NotFound: 'not-found',
} as const

export type UmamiEvent = (typeof UmamiEvent)[keyof typeof UmamiEvent]

export const resumeDownloadEvent = (locale: string) => `resume-download-${locale}`

export type LinkEvent = {
  name: UmamiEvent
  data: Record<string, string>
}

const FEED_PATH = '/blog/feed.xml'
const FILE_PATH = /^\/api\/[^/]+\/file\/(.+)$/

/**
 * The event a click on a link stands for, or null for an ordinary page link
 * (the pageview covers those). Addresses and numbers are not sent, only
 * which kind of contact link was used.
 */
export const classifyLinkClick = (href: string, origin: string): LinkEvent | null => {
  let url: URL

  try {
    url = new URL(href, origin)
  } catch {
    return null
  }

  if (url.protocol === 'mailto:')
    return { name: UmamiEvent.ContactLink, data: { channel: 'email' } }

  if (url.protocol === 'tel:') return { name: UmamiEvent.ContactLink, data: { channel: 'phone' } }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

  if (url.origin !== origin) {
    return {
      name: UmamiEvent.OutboundLink,
      data: { host: url.host, url: url.origin + url.pathname },
    }
  }

  if (url.pathname === FEED_PATH) return { name: UmamiEvent.FeedLink, data: {} }

  const file = FILE_PATH.exec(url.pathname)?.[1]

  if (file) return { name: UmamiEvent.FileDownload, data: { file: decodeURIComponent(file) } }

  return null
}
