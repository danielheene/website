'use client'

import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@payloadcms/ui'

import { Icon } from '@/components/Icon'
import { Switch } from '@/components/Switch'
import { cn } from '@/lib/cn'

import './NavFooter.styles.css'

interface NavFooterProps {
  avatarSrc?: string
  email: string
  name: string
}

interface DropdownPosition {
  top: number
  left: number
}

export function NavFooter({ avatarSrc, email, name }: NavFooterProps) {
  const { theme, setTheme } = useTheme()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false)
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null)

  // Measure the trigger so the portalled dropdown can anchor to it. Reading layout
  // during render would break with a null ref and thrash on every re-render, so the
  // position is captured up front and refreshed only while the dropdown is open.
  const syncDropdownPosition = useCallback(() => {
    const trigger = buttonRef.current
    if (!trigger) return

    const { top, left } = trigger.getBoundingClientRect()
    setDropdownPosition({
      top,
      left,
    })
  }, [])

  const handleButtonClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      // Keep this click from reaching the window-level outside-click listener below,
      // which would otherwise close the dropdown immediately after this reopens it.
      event.stopPropagation()
      syncDropdownPosition()
      setDropdownIsOpen((state) => !state)
    },
    [
      syncDropdownPosition,
    ],
  )

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    const target = event.target as Node | null
    if (!target) return

    // The trigger button handles its own toggling; ignore clicks inside it or the dropdown.
    if (buttonRef.current?.contains(target)) return
    if (dropdownRef.current?.contains(target)) return

    setDropdownIsOpen(false)
  }, [])

  useEffect(() => {
    if (!dropdownIsOpen) return

    window.addEventListener('click', handleOutsideClick)
    return () => {
      window.removeEventListener('click', handleOutsideClick)
    }
  }, [
    dropdownIsOpen,
    handleOutsideClick,
  ])

  // The trigger moves when the nav rail opens/collapses or the viewport changes.
  useEffect(() => {
    if (!dropdownIsOpen) return

    syncDropdownPosition()

    window.addEventListener('resize', syncDropdownPosition)
    return () => {
      window.removeEventListener('resize', syncDropdownPosition)
    }
  }, [
    dropdownIsOpen,
    syncDropdownPosition,
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
          className="nav-footer__avatar"
          src={avatarSrc}
          alt={name || 'User Avatar'}
        />
      ) : (
        <div className="nav-footer__avatar-fallback">{initials}</div>
      ),
    [
      avatarSrc,
      name,
      initials,
    ],
  )

  const nameComponent = useMemo(
    () => (
      <div className="nav-footer__identity">
        <span className="nav-footer__name">{name}</span>
        <span className="nav-footer__email">{email}</span>
      </div>
    ),
    [
      name,
      email,
    ],
  )

  return (
    <Fragment>
      <footer className="nav-footer">
        <div className="nav-footer__trigger-wrapper">
          <button
            type="button"
            ref={buttonRef}
            onClick={handleButtonClick}
            aria-expanded={dropdownIsOpen}
            aria-haspopup="menu"
            className={cn([
              'nav-footer__trigger',
              dropdownIsOpen && 'nav-footer__trigger--active',
            ])}
          >
            {avatarComponent}
            {nameComponent}
            <Icon name="lucide:chevrons-up-down" className="nav-footer__chevron" />
          </button>
        </div>
      </footer>
      {dropdownIsOpen &&
        dropdownPosition &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
            className="nav-footer__dropdown"
          >
            <div className="nav-footer__dropdown-header">
              {avatarComponent}
              {nameComponent}
            </div>

            <hr className="nav-footer__separator" />

            <Link href="/admin/account" className="nav-footer__item">
              <Icon name="lucide:settings" />
              <span>Account Settings</span>
            </Link>

            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="nav-footer__item"
            >
              <Icon
                name="lucide:moon"
                className={
                  theme === 'dark'
                    ? 'nav-footer__item-icon--visible'
                    : 'nav-footer__item-icon--hidden'
                }
              />

              <Icon
                name="lucide:sun"
                className={
                  theme === 'dark'
                    ? 'nav-footer__item-icon--hidden'
                    : 'nav-footer__item-icon--visible'
                }
              />
              <span>Dark Mode</span>
              <Switch checked={theme === 'dark'} />
            </button>

            <hr className="nav-footer__separator" />

            <Link href="/admin/logout" className="nav-footer__item">
              <Icon name="lucide:log-out" />
              <span>Log out</span>
            </Link>
          </div>,
          document.body,
        )}
    </Fragment>
  )
}
