import { Suspense } from 'react'
import { connection } from 'next/server'

import { ServiceStatusClient } from '@/components/ServiceStatus/ServiceStatus.client'
import { fetchServiceStatus } from '@/lib/fetchers'

interface ServiceStatusProps {
  className?: string
}

const ServiceStatusWithInitialStatus = async ({ className }: ServiceStatusProps = {}) => {
  // Live status is request-time only. Without this, prerendering starts the
  // uncached heartbeat fetch, aborts it at the end of the prerender, and the
  // fetcher logs the rejection once per prerendered page.
  await connection()

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
