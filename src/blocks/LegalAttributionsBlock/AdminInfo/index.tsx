import type { UIFieldServerComponent } from 'payload'

import { Banner } from '@/components/Banner'

export const LegalAttributionsBlockAdminInfo: UIFieldServerComponent = () => (
  <Banner variant="info" className="my-4">
    Automatically renders a list of all credited media assets used across the site, along with the
    pages where they appear.
  </Banner>
)

export default LegalAttributionsBlockAdminInfo
