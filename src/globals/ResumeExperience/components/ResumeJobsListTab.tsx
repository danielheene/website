import { ListView } from '@payloadcms/next/views'
import { createClientConfig, type DocumentViewServerProps } from 'payload'

import { CollectionSlug } from '@/types/collections'

export const ResumeJobsListTab = async ({
  payload,
  permissions,
  i18n,
  initPageResult,
  visibleEntities,
  locale,
  user,
  params,
  searchParams,
}: DocumentViewServerProps) => {
  const clientConfig = createClientConfig({
    config: payload.config,
    i18n,
    importMap: payload.importMap,
    user: true,
  })

  const { docs, ...query } = await payload.find({
    collection: CollectionSlug['ResumeJobs'],
    pagination: false,
  })

  return (
    <div className="my-6">
      <ListView
        payload={payload}
        permissions={permissions}
        enableRowSelections={false}
        i18n={i18n}
        initialData={docs}
        query={query}
        visibleEntities={visibleEntities}
        params={params}
        searchParams={searchParams}
        importMap={payload.importMap}
        collectionConfig={payload.collections[CollectionSlug['ResumeJobs']].config}
        collectionSlug={CollectionSlug['ResumeJobs']}
        clientConfig={clientConfig}
        initPageResult={{
          ...initPageResult,
          globalConfig: undefined,
          collectionConfig:
            payload.collections[CollectionSlug['ResumeJobs']].config,
        }}
        viewType={'list'}
        locale={locale}
        user={user}
      />
    </div>
  )
}

export default ResumeJobsListTab
