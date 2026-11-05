import { Suspense } from 'react'

import { ServiceStatusClient } from '@/components/ServiceStatus/ServiceStatus.client'
import { fetchServiceStatus } from '@/lib/fetchers'

interface ServiceStatusProps {
  className?: string
}

const ServiceStatusWithInitialStatus = async ({ className }: ServiceStatusProps = {}) => {
  const initialStatus = await fetchServiceStatus()

  return (
    <ServiceStatusClient
      className={className}
      fetchStatus={fetchServiceStatus}
      initialStatus={initialStatus}
    />
  )
}

export const ServiceStatus = ({ className }: ServiceStatusProps = {}) => {
  return (
    <Suspense>
      <ServiceStatusWithInitialStatus className={className} />
    </Suspense>
  )
}
