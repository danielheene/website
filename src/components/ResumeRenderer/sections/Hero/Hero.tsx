// import { GlobalSlug } from '@/types/globals'
// import { unstable_cache } from 'next/cache'
// import { getPayload } from 'payload'
// import config from '@payload-config'
// import { snakeCase } from 'lodash-es'
// import { MediaImage } from '@/types/payload'
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
//     background?: MediaImage
//     portrait?: MediaImage
//   }
//
//   return <HeroClient title={title} background={background} portrait={portrait} />
// }
