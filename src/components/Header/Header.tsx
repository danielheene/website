import Link from 'next/link'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/cn'
import { getCachedPageHeaderData } from '@/lib/getPageHeaderData'

export const Header = async () => {
  const { mainNavigation } = await getCachedPageHeaderData()

  return (
    <header id="header" className="h-20 absolute top-0 z-50 w-full">
      <nav
        className={cn([
          'h-16 mt-4 container',
          'flex flex-row justify-between items-center',
        ])}
      >
        <Link href="/" className="h-10 flex items-center" aria-label="Home">
          <Logo
            variant="inline"
            className="text-2xl text-white hidden md:block"
          />
          <Logo
            variant="square"
            className="text-2xl text-white block md:hidden"
          />
        </Link>

        {mainNavigation && (
          <ul className="flex flex-row items-center gap-8 list-disc">
            {mainNavigation.map(({ id, link }) => (
              <li key={id} className="h-10 flex items-center font-mono">
                <CMSLink
                  {...link}
                  className="text-2xl leading-none text-foreground hover:text-current tracking-tighter"
                />
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  )
}
