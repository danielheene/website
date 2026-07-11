'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Image from 'next/image'
import Link from 'next/link'

import { useClickOutside, useNav, useTheme } from '@payloadcms/ui'
import { useMemo, useState } from 'react'

import { Icon } from '@/components/Icon'
import { Switch } from '@/components/Switch'
import { cn } from '@/lib/cn'

interface NavFooterProps {
  avatarSrc?: string
  email: string
  name: string
}

export function NavFooter({ avatarSrc, email, name }: NavFooterProps) {
  const { theme, setTheme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const { navOpen } = useNav()

  const initials = useMemo(() => {
    if (name === '') return ''
    if (!name.includes(' ')) return name[0].toUpperCase()

    const [first, last] = name.split(' ')
    return `${first[0]}${last[0]}`.toUpperCase()
  }, [
    name,
  ])

  const avatarComponent = useMemo(
    () =>
      avatarSrc && avatarSrc !== '' ? (
        <Image
          width={40}
          height={40}
          className="size-10 rounded-md object-cover"
          src={avatarSrc}
          alt={name || 'User Avatar'}
        />
      ) : (
        <div className="size-10 rounded-md bg-linear-to-r/oklch from-primary-500 to-cyan-500 text-primary-foreground font-medium">
          {initials}
        </div>
      ),
    [
      avatarSrc,
      name,
      initials,
    ],
  )

  const nameComponent = useMemo(
    () => (
      <div className="min-w-0 flex flex-col flex-1 grow text-left text-sm leading-tight">
        <span className="block truncate font-pp-supply-sans font-semibold">{name}</span>
        <span className="block truncate text-xs font-mono text-muted-foreground">{email}</span>
      </div>
    ),
    [
      name,
      email,
    ],
  )

  const menuItemClasses = cn([
    'relative w-full h-8 p-1.5 pl-10',
    'flex flex-row justify-between items-center',
    'no-underline cursor-pointer leading-0 font-mono rounded-md border-none',
    'bg-neutral/0 hover:bg-neutral-800/10 dark:hover:bg-neutral-200/10',
    'text-neutral-950 dark:text-neutral-50',
    '[&>iconify-icon]:absolute [&>iconify-icon]:left-5 [&>iconify-icon]:top-4',
    '[&>iconify-icon]:-translate-x-1/2 [&>iconify-icon]:-translate-y-1/2',
    '[&>iconify-icon]:transition-opacity',
  ])

  return (
    <footer
      className={cn([
        'nav__footer',
        'p-1',
      ])}
    >
      <div
        className={cn([
          'block relative w-full ',
        ])}
      >
        <button
          type="button"
          onClick={() => setDropdownOpen((state) => !state)}
          className={cn([
            'w-full m-0 p-1.5 flex flex-row items-center gap-3',
            'cursor-pointer rounded-md overflow-hidden border-none',
            'bg-neutral-100/10 hover:bg-neutral-100/20 text-neutral-50',
            dropdownOpen && 'bg-neutral-100/20',
            !navOpen && 'p-0 w-10',
          ])}
        >
          {avatarComponent}
          {nameComponent}
          <Icon name="lucide:chevrons-up-down" className="ml-auto size-4 text-muted-foreground" />
        </button>
        {dropdownOpen && (
          <div className="absolute top-[-10px] left-0 min-w-full h-0">
            <div
              className={cn([
                'min-w-full m-0 p-1.5 -translate-y-full',
                'flex flex-col gap-1 overflow-hidden rounded-md',
                'bg-neutral-50/90 dark:bg-neutral-950/90 backdrop-blur-xs',
              ])}
            >
              <div
                className={cn([
                  'flex flex-row items-center gap-4',
                  'p-2 mb-2 border-bottom border-neutral-100/20 border-b',
                ])}
              >
                {avatarComponent}
                {nameComponent}
              </div>
              <Link href="/admin/account" className={menuItemClasses}>
                <Icon name="lucide:settings" />
                <span>Account Settings</span>
              </Link>

              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  setTheme(theme === 'dark' ? 'light' : 'dark')
                }}
                className={menuItemClasses}
              >
                <Icon
                  name="lucide:moon"
                  className={theme === 'dark' ? 'opacity-100' : 'opacity-0'}
                />

                <Icon
                  name="lucide:sun"
                  className={theme === 'dark' ? 'opacity-0' : 'opacity-100'}
                />
                <span>Dark Mode</span>
                <Switch checked={theme === 'dark'} />
              </button>

              <Link href="/admin/logout" className={menuItemClasses}>
                <Icon name="lucide:log-out" />
                <span>Log out</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </footer>
  )
  //
  // return (
  //   <SidebarFooter>
  //     <Dropdown>
  //       <DropdownButton outline >
  //         <span className="flex min-w-0 items-center gap-3">
  //           <Avatar
  //             src={isMediaImage(user.avatar) ? user.avatar.url : undefined}
  //             initials={initials}
  //             className="bg-primary text-primary-foreground size-10"
  //             square
  //             alt={user.name}
  //           />
  //           <span className="min-w-0">
  //             <span className="block truncate text-sm/5 font-medium text-sidebar-foreground ">
  //               {user.name}
  //             </span>
  //             <span className="block truncate text-xs/5 font-normal text-white/70">
  //               {user.email}
  //             </span>
  //           </span>
  //         </span>
  //         <Icon icon={'heroicons:chevron-up'} />
  //       </DropdownButton>
  //       <DropdownMenu className="min-w-64" anchor="top start">
  //         <DropdownItem href="/my-profile">
  //           <Icon icon={'heroicons:user'} data-slot="icon" />
  //           <DropdownLabel>My profile</DropdownLabel>
  //         </DropdownItem>
  //         <DropdownItem
  //           href="/admin/account"
  //           className="no-underline cursor-pointer text-inherit w-full"
  //         >
  //           <Icon name="heroicons:cog-8-tooth" data-slot="icon" className="size-4 mr-2" />
  //           <DropdownLabel>Account Settings</DropdownLabel>
  //         </DropdownItem>
  //         <DropdownDivider />
  //         <DropdownItem>
  //           <Icon name="lucide:moon" className="size-4 mr-2" />
  //           <ThemeToggleDropdownItem theme={theme} setTheme={setTheme} />
  //         </DropdownItem>
  //         <DropdownItem href="/share-feedback">
  //           <Icon icon={'heroicons:light-bulb'} />
  //           <DropdownLabel>Share feedback</DropdownLabel>
  //         </DropdownItem>
  //         <DropdownDivider />
  //         <DropdownItem href="/logout">
  //           <Icon icon={'heroicons:arrow-right-start-on-rectangle'} />
  //           <DropdownLabel>Sign out</DropdownLabel>
  //         </DropdownItem>
  //       </DropdownMenu>
  //     </Dropdown>
  //   </SidebarFooter>
  // )
}
