import Link from 'next/link'

import { cn } from 'tailwind-variants'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo'
import { fetchSiteSettingsCached } from '@/lib/fetchers'

export const Header = async () => {
  const {
    header: { mainNavigation },
  } = await fetchSiteSettingsCached()

  const hasNavEntries = Array.isArray(mainNavigation.entries) && mainNavigation.entries.length > 0

  return (
    <header
      id="header"
      className={cn([
        'absolute top-0 z-50 h-20 w-full text-foreground',
        // Over a hero (always the blue duotone) the header is white in both themes.
        // The token override is for the nav links, whose button styles read
        // `--color-foreground` directly.
        '[body:has([data-hero])_&]:text-white',
        '[body:has([data-hero])_&]:[--color-foreground:var(--color-white)]',
      ])}
    >
      <nav className={cn(['container mt-4 h-16', 'flex flex-row items-center justify-between'])}>
        <Link href="/" className="flex h-10 items-center" aria-label="Home">
          <Logo variant="inline" className="hidden text-3xl text-inherit md:block" />
          <Logo variant="square" className="block text-3xl text-inherit md:hidden" />
        </Link>

        {hasNavEntries && (
          <ul className="flex list-disc flex-row items-center gap-8">
            {mainNavigation.entries.map(({ id, ...link }) => (
              <li key={id} className="flex h-10 items-center font-mono">
                <CMSLink {...link} className="text-3xl leading-none no-underline" />
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  )
}
