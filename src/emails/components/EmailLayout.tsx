import React, { Fragment } from 'react'
import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from 'react-email'

import { EmailFonts } from '@/emails/components/EmailFonts'
import { emailAssetUrl, emailIconUrl, type EmailSite } from '@/emails/site'
import { emailTheme } from '@/emails/theme'

// `public/email/logo-*.webp` are 858×96, shown at a third of that, as tall as Protocol's logo
const LOGO_WIDTH = 286
const LOGO_HEIGHT = 32

// `public/email/dither-*.webp` are 1824×720 like Protocol's activation image: the Dither shader in
// the brand duotone, shown at the content width (the 640px container less its 24px padding)
const HERO_WIDTH = 592
const HERO_HEIGHT = 234

const ICON_SIZE = 22

// the `foreground` token per theme, as the icon route's `?color=`
const ICON_COLOR = {
  light: '262626',
  dark: 'FAFAFA',
}

export type EmailLayoutProps = {
  children: React.ReactNode
  /** Shown as the inbox preview snippet, before the email is opened. */
  previewText: string
  /** The footer's last line: why the recipient got this email. */
  context: React.ReactNode
  site: EmailSite
}

/**
 * Shared chrome for every email, adapted from react-email's Protocol theme: the logo, the Dither
 * shader in the brand duotone (like Protocol's activation email), the message, and a footer with
 * the postal address, contact and profile links, legal pages and why the email was sent. Light by
 * default; clients that honor `prefers-color-scheme` get the dark theme (`dark:` utilities, see
 * {@link emailTheme}).
 */
export const EmailLayout = ({ children, previewText, context, site }: EmailLayoutProps) => (
  <Html>
    <Tailwind config={emailTheme}>
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <EmailFonts assetUrl={site.assetUrl} />
      </Head>
      {/* Body copies its styles onto an inner cell without its classes, which loses the dark
          overrides, so the page background and type sit on a full-width Section instead */}
      <Body className="m-0 p-0">
        <Preview>{previewText}</Preview>
        <Section className="dark:bg-muted-dark dark:text-foreground-dark bg-muted font-sans text-sm text-foreground">
          <Container className="dark:bg-background-dark dark:text-foreground-dark mx-auto max-w-[640px] bg-background text-foreground">
            <Section className="mobile:px-4 p-6">
              <Link href={site.url} className="inline-block">
                {/* the dark logo stays hidden where media queries don't apply (Gmail, Outlook) */}
                <Img
                  src={emailAssetUrl(site, '/email/logo-primary.webp')}
                  alt={site.name}
                  width={LOGO_WIDTH}
                  height={LOGO_HEIGHT}
                  className="block dark:hidden"
                />
                <Img
                  src={emailAssetUrl(site, '/email/logo-white.webp')}
                  alt={site.name}
                  width={LOGO_WIDTH}
                  height={LOGO_HEIGHT}
                  className="hidden dark:block"
                />
              </Link>
            </Section>

            <Section className="mobile:px-4 px-6">
              {(['light', 'dark'] as const).map((theme) => (
                <Img
                  key={theme}
                  src={emailAssetUrl(site, `/email/dither-${theme}.webp`)}
                  alt=""
                  width={HERO_WIDTH}
                  height={HERO_HEIGHT}
                  className={
                    theme === 'light'
                      ? 'block h-auto w-full max-w-[592px] dark:hidden'
                      : 'hidden h-auto w-full max-w-[592px] dark:block'
                  }
                />
              ))}
            </Section>

            <Section className="mobile:px-4 mobile:py-10 px-6 py-14">{children}</Section>

            <Section className="mobile:px-4 dark:border-border-dark border-0 border-t border-solid border-border px-6 pt-12 pb-8">
              {site.address.length > 0 && (
                <Text className="dark:text-muted-foreground-dark m-0 text-muted-foreground">
                  {site.address.map((line, index) => (
                    <span
                      key={line}
                      className={`block font-sans ${index === 0 ? 'font-medium text-base' : 'font-normal text-sm leading-tight'}`}
                    >
                      {line}
                      <br />
                    </span>
                  ))}
                </Text>
              )}

              {/* Row centers by default; a zero margin keeps it left without floating like align="left" */}
              {site.socialLinks.length > 0 && (
                <Row className="mt-8 ml-0 w-auto">
                  {site.socialLinks.map(({ icon, label, href }, index, array) => (
                    <Column key={href} className="pr-4">
                      <Link
                        href={href}
                        className="inline-block overflow-hidden"
                        style={{ width: `${ICON_SIZE}px`, height: `${ICON_SIZE}px` }}
                      >
                        {(['light', 'dark'] as const).map((theme) => (
                          <Img
                            key={theme}
                            src={emailIconUrl(site, icon, ICON_COLOR[theme])}
                            alt={label}
                            width={ICON_SIZE}
                            height={ICON_SIZE}
                            className={theme === 'light' ? 'dark:hidden' : 'light:hidden'}
                          />
                        ))}
                        {label}
                      </Link>
                      {index < array.length - 1 && (
                        <span className="hidden">
                          <br />
                        </span>
                      )}
                    </Column>
                  ))}
                </Row>
              )}

              {site.legalLinks.length > 0 && (
                <Text className="dark:text-muted-foreground-dark m-0 mt-8 font-mono text-xs text-muted-foreground">
                  {site.legalLinks.map(({ label, href }, index, array) => (
                    <Fragment key={href}>
                      {index > 0 && <span data-skip-in-text="true"> · </span>}

                      <Link
                        href={href}
                        className="dark:text-muted-foreground-dark text-muted-foreground underline"
                      >
                        {label}
                      </Link>
                      {index < array.length - 1 && (
                        <span className="hidden">
                          <br />
                        </span>
                      )}
                    </Fragment>
                  ))}
                </Text>
              )}

              <Text className="dark:text-muted-foreground-dark m-0 mt-5 max-w-[400px] font-mono text-xs text-muted-foreground">
                {context}
              </Text>
            </Section>
          </Container>
        </Section>
      </Body>
    </Tailwind>
  </Html>
)
