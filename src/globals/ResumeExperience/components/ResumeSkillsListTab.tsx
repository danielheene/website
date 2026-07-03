import { ListView } from '@payloadcms/next/views'
import { createClientConfig, type DocumentViewServerProps } from 'payload'

import { CollectionSlug } from '@/types/collections'

export const ResumeSkillsListTab = async ({
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
    collection: CollectionSlug.ResumeSkills,
    pagination: false,
    limit: 0,
  })

  return (
    <div className="my-6">
      <ListView
        payload={payload}
        permissions={permissions}
        enableRowSelections={false}
        i18n={i18n}
        initialData={docs}
        // query={query}
        visibleEntities={visibleEntities}
        // params={params}
        // searchParams={searchParams}
        importMap={payload.importMap}
        collectionConfig={
          payload.collections[CollectionSlug.ResumeSkills].config
        }
        collectionSlug={CollectionSlug.ResumeSkills}
        clientConfig={clientConfig}
        initPageResult={{
          ...initPageResult,
          globalConfig: undefined,
          collectionConfig:
            payload.collections[CollectionSlug.ResumeSkills].config,
        }}
        viewType={'list'}
        locale={locale}
        user={user}
      />
    </div>
  )
}

export default ResumeSkillsListTab
