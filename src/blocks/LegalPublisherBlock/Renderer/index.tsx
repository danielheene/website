import parsePhoneNumber from 'libphonenumber-js'
import { cn } from 'tailwind-variants'

import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { fetchGlobalUserSettingsCached } from '@/lib/fetchers'

export const LegalPublisherBlockRenderer = async () => {
  const {
    name,
    address,
    email,
    telephone: telephoneRaw,
    vatID,
  } = await fetchGlobalUserSettingsCached('en')
  const telephone = parsePhoneNumber(telephoneRaw)
  const normalizedEmail = email.trim()
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  const safeMailtoHref = isValidEmail ? `mailto:${encodeURIComponent(normalizedEmail)}` : '#'

  return (
    <section>
      <address
        className={cn([
          'flex flex-col gap-4',
          'text-foreground not-italic font-mono text-lg leading-snug',
          '[&_strong]:font-bold',
        ])}
      >
        <p>
          <strong>{name}</strong>
        </p>
        <p>
          {address.street} {address.number}
          <br />
          {address.postCode} {address.place}
          <br />
          {address.countryName}
        </p>
        <p>
          <Button variant="link" asChild className="no-underline h-auto">
            <a href={safeMailtoHref}>
              <Icon name="mail" data-icon="inline-start" /> {isValidEmail ? normalizedEmail : email}
            </a>
          </Button>
          <br />
          <Button variant="link" asChild className="no-underline h-auto">
            <a href={telephone.getURI()}>
              <Icon name="phone" data-icon="inline-start" />
              {telephone.formatInternational()}
            </a>
          </Button>
        </p>
        {vatID && (
          <p>
            <strong>VAT ID:</strong> {vatID}
          </p>
        )}
      </address>

      <p className="py-4 block text-sm opacity-80">
        This Legal Notice complies with the German laws under § 5 DDG and § 55 RStV.
      </p>
    </section>
  )
}

export default LegalPublisherBlockRenderer
