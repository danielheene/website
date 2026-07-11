import config from '@payload-config'

import { getPayload } from 'payload'

import { cn } from '@/lib/cn'
import { CollectionSlug } from '@/types/collections'



export default async function ResumeDocumentPage({ params }: PageProps<'/resume/document/[id]'>) {
  const { id } = await params
  if (id === 'latest') {
  }
  return (
    <div>
      <section
        className={cn([
          'min-w-screen aspect-21-9 relative overflow-hidden',
          'bg-linear-to-bl from-purple-500 via-indigo-500 to-primary-600',
        ])}
      >
        <div
          className={cn([
            'w-0 h-0 absolute left-[85%] bottom-[-10%] rotate-[-195deg]',
          ])}
        >
          <div
            className={cn([
              'aspect-210/297 w-[50vw] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'bg-white',
            ])}
          ></div>
        </div>
      </section>
    </div>
  )
}

export async function generateStaticParams() {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug['ResumeDocuments'],
    draft: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return docs.map(({ slug }) => ({
    slug,
  }))
}
