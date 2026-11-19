import { UIFieldServerComponent } from 'payload'

import { cn } from 'tailwind-variants'

import { Button } from '@/components/Button'
import { Headline } from '@/components/Headline'
import { Icon } from '@/components/Icon'
import { fetchGlobalUserSettingsCached } from '@/lib/fetchers'

export const LegalPublisherBlockRenderer: UIFieldServerComponent = async ({ siblingData }) => {
  const { name, address, email, phoneNumber, vatID } = await fetchGlobalUserSettingsCached('en')
  const { title } = siblingData

  return (
    <section>
      <Headline variant="section" className="mb-4">
        {title}
      </Headline>

      <address
        className={cn([
          'flex flex-col gap-4',
          'font-mono text-lg leading-snug text-foreground not-italic',
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
          <Button variant="link" asChild className="h-auto no-underline">
            <a href={`mailto:${email}`}>
              <Icon name="mail" data-icon="inline-start" /> {email}
            </a>
          </Button>
          {phoneNumber?.uri && (
            <>
              <br />
              <Button variant="link" asChild className="h-auto no-underline">
                <a href={phoneNumber.uri}>
                  <Icon name="phone" data-icon="inline-start" />
                  {phoneNumber.formatted}
                </a>
              </Button>
            </>
          )}
        </p>
        {vatID && (
          <p>
            <strong>VAT ID:</strong> {vatID}
          </p>
        )}
      </address>

      <p className="block py-4 text-sm opacity-80">
        This Legal Notice complies with the German laws under § 5 DDG and § 55 RStV.
      </p>
    </section>
  )
}

export default LegalPublisherBlockRenderer
