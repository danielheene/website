'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/utilities/cn'
import { ChevronsUpDown, LogOut, Settings, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

interface NavFooterProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function NavFooter({
  user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '',
  },
}: NavFooterProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <footer className="absolute left-2 right-2 bottom-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            variant="outline"
            className={cn([
              'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
              'w-full border-0 flex flex-row cursor-pointer [ m-0 h-14',
            ])}
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-full rounded-xl border-0 "
          side="top"
          align="start"
          sideOffset={8}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 px-2 py-2 text-left">
              <Avatar className="size-10 rounded-lg">
                <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-medium">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <UserIcon className="size-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/admin/account" className="no-underline cursor-pointer text-inherit w-full">
                <Settings className="size-4 mr-2" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Link href="/admin/logout" className="no-underline cursor-pointer text-inherit w-full">
              <LogOut className="size-4 mr-2 text-inherit" />
              <span>Log out</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </footer>
  )
}
