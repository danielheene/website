import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import { CollectionSlug } from '@/types/collections'

export default async function Page() {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({
    config,
  })

  const { docs } = await payload.find({
    collection: CollectionSlug.BlogTags,
    draft,
    limit: 1000,
    pagination: false,
    select: {
      title: true,
      slug: true,
      content: true,
    },
  })

  return (
    <div
      className="flex min-h-svh w-full flex-col bg-background text-foreground dark"
      id="screenshot"
      data-theme-scope="preview"
    >
      <div className="flex flex-1 items-center justify-center">
        <section className="py-32 w-full">
          <div className="container">
            <div className="mb-24 flex flex-col items-center gap-6">
              <h1 className="text-center text-3xl font-semibold lg:max-w-3xl lg:text-5xl">
                Blocks built with Shadcn &amp; Tailwind
              </h1>
              <p className="text-center text-lg font-medium text-muted-foreground md:max-w-4xl lg:text-xl">
                Finely crafted components built with React, Tailwind and Shadcn
                UI. Developers can copy and paste these blocks directly into
                their project.
              </p>
            </div>
            <div className="relative flex justify-center">
              <div className="border-muted2 relative flex w-full flex-col border md:w-1/2 lg:w-full">
                <div className="relative flex flex-col lg:flex-row">
                  <div className="border-muted2 flex flex-col justify-between border-b border-solid p-10 lg:w-3/5 lg:border-r lg:border-b-0">
                    <h2 className="text-xl font-semibold">UI/UX Design</h2>
                    <p className="text-muted-foreground">
                      Creating intuitive user experiences with modern interface
                      design principles and user-centered methodologies.
                    </p>
                    <img
                      alt="UI/UX Design"
                      className="mt-8 aspect-[1.5] h-full w-full object-cover lg:aspect-[2.4]"
                      src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
                    />
                  </div>
                  <div className="flex flex-col justify-between p-10 lg:w-2/5">
                    <h2 className="text-xl font-semibold">
                      Responsive Development
                    </h2>
                    <p className="text-muted-foreground">
                      Building websites that look and function perfectly across
                      all devices and screen sizes.
                    </p>
                    <img
                      alt="Responsive Development"
                      className="mt-8 aspect-[1.45] h-full w-full object-cover"
                      src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg"
                    />
                  </div>
                </div>
                <div className="border-muted2 relative flex flex-col border-t border-solid lg:flex-row">
                  <div className="border-muted2 flex flex-col justify-between border-b border-solid p-10 lg:w-2/5 lg:border-r lg:border-b-0">
                    <h2 className="text-xl font-semibold">Brand Integration</h2>
                    <p className="text-muted-foreground">
                      Seamlessly incorporating your brand identity into every
                      aspect of your website's design.
                    </p>
                    <img
                      alt="Brand Integration"
                      className="mt-8 aspect-[1.45] h-full w-full object-cover"
                      src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg"
                    />
                  </div>
                  <div className="flex flex-col justify-between p-10 lg:w-3/5">
                    <h2 className="text-xl font-semibold">
                      Performance Optimization
                    </h2>
                    <p className="text-muted-foreground">
                      Ensuring fast loading times and smooth performance through
                      optimized code and assets.
                    </p>
                    <img
                      alt="Performance Optimization"
                      className="mt-8 aspect-[1.5] h-full w-full object-cover lg:aspect-[2.4]"
                      src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-4.svg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
