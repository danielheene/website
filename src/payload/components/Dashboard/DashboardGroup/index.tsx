import { AdminGroup } from '@custom-types'
import { formatAdminURL } from '@payloadcms/ui/shared'
import Link from 'next/link'
import type { BasePayload, EntityType, StaticLabel } from 'payload'

import { cn } from '@/utilities/cn'

import './index.scss'

import { type FC, useMemo } from 'react'

type Props = {
  adminRoute: string
  groupLabel?: string
  entities: {
    label: StaticLabel
    slug: string
    type: EntityType
  }[]
  payload: BasePayload
}

export const DashboardGroup: FC<Props> = ({ groupLabel, adminRoute, entities, payload }) => {
  // const getCounts = async () => {
  //   const docCounts: Record<string, number> = {}
  //   for (let i = 0; i < entities.length; i++) {
  //     const slug = entities[i].slug as CollectionSlug
  //     const { totalDocs } = await payload.count({ collection: slug })
  //     docCounts[slug] = totalDocs
  //   }
  //   return docCounts
  // }
  //
  // const isFeaturedGroup = groupLabel === AdminGroup['Blog']
  // let counts: Record<string, number>
  //
  // if (isFeaturedGroup) {
  //   counts = await getCounts()
  // }

  console.log('groupLabel', groupLabel)
  console.log('entities', entities)
  console.log('adminRoute', adminRoute)

  const { isResumeGroup, isRegularGroup, isSettingsGroup } = useMemo(() => {
    const isResumeGroup = groupLabel === AdminGroup.Resume
    const isSettingsGroup = groupLabel === AdminGroup.Settings
    const isRegularGroup = !isResumeGroup && !isSettingsGroup
    return { isResumeGroup, isSettingsGroup, isRegularGroup }
  }, [groupLabel])

  return (
    <section className={cn('@container')}>
      <p className="dashboard__label">{groupLabel}</p>

      <div
        className={cn([
          'px-[16px] md:px-[40px] lg:px-[60px] gap-5', // payloads own container paddings
          'grid grid-cols-12 @5xl:grid-cols-10',
        ])}
      >
        {entities
          // .filter(({ slug }) => slug !== GlobalSlug.Hero) // TODO: remove after refactoring
          .map(({ slug, type, label }, index, array) => {
            // const Icon = adminGroupsConfig[groupLabel as AdminGroup]?.entities?.[slug]?.Icon || Fragment
            const title = typeof label === 'object' ? label?.singular : label
            const href = formatAdminURL({ adminRoute, path: `/${type}/${slug}` })
            console.log(type)

            return (
              <Link
                key={index}
                href={href}
                className={cn([
                  'group/dashboard-card',
                  'col-span-12 @md:col-span-6 @xl:col-span-4 @3xl:col-span-3 @5xl:col-span-2',
                  array.length % 2 && index === array.length - 1 && '@md:col-start-4',
                  array.length % 3 && index === array.length - 2 && '@xl:col-start-3',
                  'relative h-32 overflow-hidden',
                  'bg-primary-700 transition-colors duration-300',
                  'border border-2 border-white rounded-xl',
                ])}
              >
                {/*<Icon*/}
                {/*  className={cn([*/}
                {/*    'absolute -left-8 -bottom-4 max-w-full max-h-full',*/}
                {/*    'text-white/20 transition-all duration-300',*/}
                {/*    'group-hover/dashboard-card:scale-140',*/}
                {/*    'group-hover/dashboard-card:text-white-100',*/}
                {/*  ])}*/}
                {/*/>*/}
                <p
                  className={cn([
                    'absolute inset-4',
                    'flex flex-col items-center justify-center',
                    'font-pp-supply-mono text-white text-center',
                    'scale-75 transition-all duration-300',
                    'group-hover/dashboard-card:scale-100',
                    'text-lg @4xl:text-xl @6xl:text-2xl @7xl:text-3xl',
                  ])}
                >
                  {title}
                </p>
              </Link>
            )
          })}
      </div>
    </section>
  )
}
