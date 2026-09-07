import { JSX, Suspense } from 'react'
import Link from 'next/link'

import { Banner } from '@/components/Banner'
import { fetchNewerDocumentVersions } from '@/lib/fetchers/fetchNewerDocumentVersions'

/**
 * Displays a banner indicating whether the current resume version is the latest or if there are newer versions available.
 * Messages should have an almost equal number of characters to avoid flickering.
 */
const messages = {
  isFetchingVersions: 'Checking if this resume is still up to date',
  isLatestVersion: 'This is still the most recent version of my resume.',
  hasNewerVersions: 'There is a newer version of my resume available',
}

interface ResumeNewerVersionsCheckerProps {
  createdAt: string
}

const ResumeNewerVersionsCheckerBanner = async ({
  createdAt,
}: ResumeNewerVersionsCheckerProps): Promise<JSX.Element> => {
  const newerVersions = await fetchNewerDocumentVersions(createdAt)

  return newerVersions ? (
    <Banner variant="warning" inverse>
      {messages.hasNewerVersions}&ensp;
      <Link href="/resume/latest" className="underline underline-offset-2">
        here
      </Link>
      .
    </Banner>
  ) : (
    <Banner variant="success" inverse>
      {messages.isLatestVersion}
    </Banner>
  )
}

export const ResumeNewerVersionsChecker = ({
  createdAt,
}: ResumeNewerVersionsCheckerProps): JSX.Element => (
  <Suspense
    fallback={
      <Banner customIcon="loading" rotateIcon variant="neutral" inverse>
        {messages.isFetchingVersions}
      </Banner>
    }
  >
    <ResumeNewerVersionsCheckerBanner createdAt={createdAt} />
  </Suspense>
)
