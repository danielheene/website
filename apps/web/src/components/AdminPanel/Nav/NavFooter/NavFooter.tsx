'use client'

import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { useClickOutside, useNav, useTheme } from '@payloadcms/ui'

import { Icon } from '@/components/Icon'
import { Switch } from '@/components/Switch'
import { cn } from '@repo/utils/cn'

interface NavFooterProps {
  avatarSrc?: string
  email: string
  name: string
}

export function NavFooter({ avatarSrc, email, name }: NavFooterProps) {
  const { theme, setTheme } = useTheme()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false)

  const { navOpen } = useNav()

  const handleButtonClick = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setDropdownIsOpen((state) => !state)
  }, [])

  const handleOutsideClick = useCallback(
    (event: PointerEvent) => {
      event.preventDefault()
      if (
        dropdownIsOpen &&
        event.target !== buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        event.target !== dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownIsOpen((state) => !state)
      }
    },
    [
      dropdownIsOpen,
    ],
  )

  useEffect(() => {
    window.addEventListener('click', handleOutsideClick)
    return () => {
      window.removeEventListener('click', handleOutsideClick)
    }
  }, [
    handleOutsideClick,
  ])

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
        <div
          className={cn([
            'flex justify-center items-center',
            'size-10 text-primary-foreground font-medium',
            'bg-linear-to-r/oklch from-primary-500 to-cyan-500',
          ])}
        >
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
    '[&>svg]:absolute [&>svg]:left-5 [&>svg]:top-4',
    '[&>svg]:-translate-x-1/2 [&>svg]:-translate-y-1/2',
    '[&>svg]:transition-opacity',
  ])

  return (
    <Fragment>
      <footer
        className={cn([
          'nav__footer',
          'p-1',
        ])}
      >
        <div
          className={cn([
            'block relative w-full',
          ])}
        >
          <button
            type="button"
            ref={buttonRef}
            onClick={handleButtonClick}
            className={cn([
              'w-full m-0 p-1.5 flex flex-row items-center gap-3',
              'cursor-pointer rounded-md overflow-hidden border-none',
              'bg-neutral-100/10 hover:bg-neutral-100/20 text-neutral-50',
              dropdownIsOpen && 'bg-neutral-100/20',
              !navOpen && 'p-0 w-10',
            ])}
          >
            {avatarComponent}
            {nameComponent}
            <Icon name="lucide:chevrons-up-down" className="ml-auto size-4 text-muted-foreground" />
          </button>
        </div>
      </footer>
      {dropdownIsOpen &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            style={{
              top: buttonRef.current.getBoundingClientRect().top,
              left: buttonRef.current.getBoundingClientRect().left,
            }}
            className={cn([
              'fixed',
              'w-[calc(var(--nav-width-open)-var(--nav-spacing))]',
              'm-0 p-1.5 -translate-y-[calc(100%+1rem)]',
              'flex flex-col gap-2 overflow-hidden rounded-md',
              'bg-neutral-50/90 dark:bg-neutral-950/90 backdrop-blur-xs',
            ])}
          >
            <div
              className={cn([
                'flex flex-row items-center gap-4',
                'p-2 border-bottom',
              ])}
            >
              {avatarComponent}
              {nameComponent}
            </div>

            <hr className="block w-[90%] h-px border-b border-b-border opacity-40" />

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
              <Icon name="lucide:moon" className={theme === 'dark' ? 'opacity-100' : 'opacity-0'} />

              <Icon name="lucide:sun" className={theme === 'dark' ? 'opacity-0' : 'opacity-100'} />
              <span>Dark Mode</span>
              <Switch checked={theme === 'dark'} />
            </button>

            <hr className="block w-[90%] h-px border-b border-b-border opacity-40" />

            <Link href="/admin/logout" className={menuItemClasses}>
              <Icon name="lucide:log-out" />
              <span>Log out</span>
            </Link>
          </div>,
          document.body,
        )}
    </Fragment>
  )
}
