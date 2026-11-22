'use client'

import { cn } from 'tailwind-variants'

import { Button } from '@/components/Button'
import { Headline } from '@/components/Headline'
import { Reveal } from '@/components/Reveal'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import type { BlockAnchors } from '@/lib/extractHeadings'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import type { PhoneNumberData, ResumeContactBlock } from '@/types/payload'

import { ContactForm } from './ContactForm.client'

interface ResumeContactBlockClientRendererProps extends ResumeContactBlock, BlockAnchors {
  title: string
  /** From the user settings, for the direct mail button. */
  email?: string | null
  /** From the user settings, for the direct call button. */
  phoneNumber?: PhoneNumberData | null
}

/**
 * Two columns: headline, caption and direct mail/call buttons on the left, the contact form on
 * the right. Stacked on small screens.
 */
export const ResumeContactBlockClientRenderer = ({
  anchorId,
  blockType: _blockType,
  title,
  caption,
  email,
  phoneNumber,
}: ResumeContactBlockClientRendererProps) => (
  <SectionContainer id={anchorId} title={title} variant="default">
    <Reveal className="container grid grid-cols-12 gap-y-16 py-32 lg:gap-x-16">
      <div className="col-span-12 flex flex-col gap-10 lg:col-span-5">
        {title && (
          <div data-reveal-item>
            <Headline variant="section">{title}</Headline>
          </div>
        )}
        {!isEmptyValue(caption) && (
          <div data-reveal-item>
            <RichText
              data={caption}
              enableGutter={false}
              enableProse={false}
              className="text-lg text-muted-foreground"
            />
          </div>
        )}
        {(email || phoneNumber?.uri) && (
          <div data-reveal-item className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            {phoneNumber?.uri && (
              <Button variant="outline" size="lg" startIcon="mdi:phone-outline" asChild>
                <a href={phoneNumber.uri}>{phoneNumber.formatted || phoneNumber.value}</a>
              </Button>
            )}
            {email && (
              <Button
                variant="outline"
                size="lg"
                startIcon="mdi:email-outline"
                // addresses are case-sensitive in their local part, so they are shown as entered
                className="normal-case"
                asChild
              >
                <a href={`mailto:${email}`}>{email}</a>
              </Button>
            )}
          </div>
        )}
      </div>
      <div className={cn(['col-span-12 lg:col-span-6 lg:col-start-7'])} data-reveal-item>
        <ContactForm />
      </div>
    </Reveal>
  </SectionContainer>
)
