import type { UIFieldServerComponent } from 'payload'

import { Banner } from '@/components/Banner'

export const LegalPublisherInformationBlockAdminInfo: UIFieldServerComponent = () => (
  <Banner variant="info" className="my-4">
    Automatically renders a section displaying all legally required publisher information.
  </Banner>
)

export default LegalPublisherInformationBlockAdminInfo
