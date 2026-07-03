'use client'

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSection,
  MenuSeparator,
} from '@headlessui/react'
import { useNav, useTheme } from '@payloadcms/ui'
import { Fragment } from 'react'

import { Icon } from '@/components/Icon'
import { ThemeToggleDropdownItem } from '@/components/ThemeToggle'
import { Avatar } from '@/components/ui/avatar'
import { isMediaImage } from '@/lib/typeGuards'
import type { User } from '@/types/payload'

interface NavFooterProps {
  user: User
}

export function NavFooter({ user }: NavFooterProps) {
  const { theme, setTheme } = useTheme()
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const { navOpen } = useNav()

  const avatar = (
    <Avatar
      className="size-10 bg-primary text-primary-foreground"
      src={isMediaImage(user.avatar) ? user.avatar.url : undefined}
      initials={initials}
      alt={user.name}
      square
    />
  )

  const name = (
    <div className="min-w-0 flex flex-col flex-1 flex-grow text-left text-sm leading-tight">
      <span className="block truncate font-semibold">{user.name}</span>
      <span className="block truncate text-xs text-muted-foreground">
        {user.email}
      </span>
    </div>
  )

  return (
    <footer className="nav__footer">
      <Menu>
        <MenuButton
          as={Fragment}
          // className={cn([
          //   'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
          //   'w-full border-0 flex flex-row cursor-pointer m-0 h-14',
          //   !navOpen && 'p-0 w-10',
          // ])}
        >
          {({ active, open }) => (
            <span className="flex min-w-0 w-full items-center gap-3">
              {avatar}
              {name}
              <Icon
                name="lucide:chevrons-up-down"
                className="ml-auto size-4 text-muted-foreground"
              />
            </span>
          )}
        </MenuButton>
        <MenuItems
          // side="top" top
          // align="start"
          // sideOffset={8}
          className="min-w-64 bg-card text-sidebar-accent-foreground border-sidebar-border"
          anchor="top start"
        >
          <div className="p-0 font-normal">
            <div className="flex items-center gap-3 px-2 py-2 text-left">
              {avatar}
              {name}
            </div>
          </div>
          <MenuSeparator />
          <MenuSection>
            <MenuItem
              as="a"
              href="/admin/account"
              className="no-underline cursor-pointer text-inherit w-full"
            >
              <Icon
                name="lucide:settings"
                className="text-xl mr-2"
                slot="icon"
              />
              <span>Account Settings</span>
            </MenuItem>
          </MenuSection>
          <MenuSeparator />
          <MenuSection>
            <ThemeToggleDropdownItem theme={theme} setTheme={setTheme} />
          </MenuSection>
          <MenuSeparator />
          <MenuSection>
            <MenuItem
              as="a"
              href="/admin/logout"
              className="no-underline cursor-pointer text-inherit w-full"
            >
              <Icon
                name="lucide:log-out"
                className="size-4 mr-2 text-inherit"
              />
              <span>Log out</span>
            </MenuItem>
          </MenuSection>
        </MenuItems>
      </Menu>
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
