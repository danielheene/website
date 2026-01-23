// import { GlobalSlug } from '@custom-types'
// import { unstable_cache } from 'next/cache'
// import { getPayload } from 'payload'
// import config from '@payload-config'
// import { snakeCase } from 'lodash-es'
// import { Media } from '@payload-types'
// import { HeroClient } from '@/components/ResumeRenderer/sections/Hero/Hero.client'
//
// const getHeroData = unstable_cache(
//   async () => {
//     const payload = await getPayload({ config })
//
//     return await payload.findGlobal({
//       slug: GlobalSlug.Hero,
//       draft: false,
//       depth: 2,
//     })
//   },
//   [GlobalSlug.Hero],
//   { tags: [snakeCase(GlobalSlug.Hero)] },
// )
//
// export const Hero = async () => {
//   const { title, background, portrait } = (await getHeroData()) as {
//     title?: string
//     background?: Media
//     portrait?: Media
//   }
//
//   return <HeroClient title={title} background={background} portrait={portrait} />
// }
