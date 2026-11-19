import type { UIFieldServerComponent } from 'payload'

import { Banner } from '@/components/Banner'

export const LegalAttributionsBlockAdminInfo: UIFieldServerComponent = () => (
  <Banner variant="info" className="my-4">
    Automatically renders a list of every media asset containing a credit line that is used
    somewhere on the site, along with the pages it appears on.
  </Banner>
)

export default LegalAttributionsBlockAdminInfo
