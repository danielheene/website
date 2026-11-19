import type { UIFieldServerComponent } from 'payload'

import { Banner } from '@/components/Banner'

/**
 * Editor-facing placeholder. The block itself has no editable content — the
 * credits list is derived at render time from the media assets referenced
 * across the site.
 */
export const LegalAuthorshipBlockAdminInfo: UIFieldServerComponent = () => (
  <Banner variant="info" className="my-4">
    Automatically renders a list of every media asset containing a credit line that is used
    somewhere on the site, along with the pages it appears on.
  </Banner>
)

export default LegalAuthorshipBlockAdminInfo
